<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service\Proposal;

use DateTimeZone;
use Exception;
use OCA\Calendar\Db\ProposalDateMapper;
use OCA\Calendar\Db\ProposalMapper;
use OCA\Calendar\Db\ProposalParticipantMapper;
use OCA\Calendar\Db\ProposalVoteMapper;
use OCA\Calendar\Objects\Proposal\ProposalDateCollection;
use OCA\Calendar\Objects\Proposal\ProposalDateObject;
use OCA\Calendar\Objects\Proposal\ProposalDateVote;
use OCA\Calendar\Objects\Proposal\ProposalObject;
use OCA\Calendar\Objects\Proposal\ProposalParticipantCollection;
use OCA\Calendar\Objects\Proposal\ProposalParticipantObject;
use OCA\Calendar\Objects\Proposal\ProposalParticipantRealm;
use OCA\Calendar\Objects\Proposal\ProposalParticipantStatus;
use OCA\Calendar\Objects\Proposal\ProposalResponseObject;
use OCA\Calendar\Objects\Proposal\ProposalVoteCollection;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarIsWritable;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager;
use OCP\IAppConfig;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserManager;
use OCP\Mail\IMailer;
use OCP\Mail\Provider\Address;
use OCP\Mail\Provider\IManager as IMailManager;
use OCP\Mail\Provider\IMessageSend;
use Psr\Log\LoggerInterface;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Component\VEvent;
use Symfony\Component\Uid\Uuid;

class ProposalService {

	public function __construct(
		private IAppConfig $appConfig,
		private LoggerInterface $logger,
		private ProposalMapper $proposalMapper,
		private ProposalParticipantMapper $proposalParticipantMapper,
		private ProposalDateMapper $proposalDateMapper,
		private ProposalVoteMapper $proposalVoteMapper,
		private IL10N $l10n,
		private IURLGenerator $urlGenerator,
		private IUserManager $userManager,
		private IMailer $systemMailManager,
		private IMailManager $userMailManager,
		private IManager $calendarManager,
	) {
	}

	public function listProposals(IUser $user): array {
		// retrieve all proposals, participants, dates, and votes for the user
		$proposalEntries = $this->proposalMapper->fetchByUserId($user->getUID());
		$proposalParticipantEntries = $this->proposalParticipantMapper->fetchByUserId($user->getUID());
		$proposalDateEntries = $this->proposalDateMapper->fetchByUserId($user->getUID());
		$proposalVoteEntries = $this->proposalVoteMapper->fetchByUserId($user->getUID());
		// organize the participant entries by proposal ID ['pid' => [participant, ...]]
		$proposalParticipantEntries = array_reduce(
			$proposalParticipantEntries,
			function ($carry, $entry) {
				$pid = $entry->getPid();
				$carry[$pid][] = $entry;
				return $carry;
			},
			[]
		);
		// organize the date entries by proposal ID ['pid' => [date, ...]]
		$proposalDateEntries = array_reduce(
			$proposalDateEntries,
			function ($carry, $entry) {
				$pid = $entry->getPid();
				$carry[$pid][] = $entry;
				return $carry;
			},
			[]
		);
		// organize the vote entries by proposal ID ['pid' => [vote, ...]]
		$proposalVoteEntries = array_reduce(
			$proposalVoteEntries,
			function ($carry, $entry) {
				$pid = $entry->getPid();
				$carry[$pid][] = $entry;
				return $carry;
			},
			[]
		);
		// convert the store entries to objects
		$proposals = [];
		foreach ($proposalEntries as $proposalEntry) {
			// convert the store format to a proposal object
			$proposal = new ProposalObject();
			$proposal->fromStore($proposalEntry);
			$proposalParticipants = $proposal->getParticipants();
			if (isset($proposalParticipantEntries[$proposalEntry->getId()])) {
				$proposalParticipants->fromStore($proposalParticipantEntries[$proposalEntry->getId()]);
			}
			$proposalDates = $proposal->getDates();
			if (isset($proposalDateEntries[$proposalEntry->getId()])) {
				$proposalDates->fromStore($proposalDateEntries[$proposalEntry->getId()]);
			}
			$proposalVotes = $proposal->getVotes();
			if (isset($proposalVoteEntries[$proposalEntry->getId()])) {
				$proposalVotes->fromStore($proposalVoteEntries[$proposalEntry->getId()]);
			}
			// add the proposal to the list
			$proposals[] = $proposal;
		}

		return $proposals;
	}

	public function fetchProposal(IUser $user, int $id): ?ProposalObject {
		// fetch the proposal entry by id
		$proposalEntry = $this->proposalMapper->fetchById($user->getUID(), $id);
		if ($proposalEntry === null) {
			return null;
		}
		// retrieve the participants, dates, and votes for this proposal
		$proposalParticipantEntries = $this->proposalParticipantMapper->fetchByProposalId($user->getUID(), $id);
		$proposalDateEntries = $this->proposalDateMapper->fetchByProposalId($user->getUID(), $id);
		$proposalVoteEntries = $this->proposalVoteMapper->fetchByProposalId($user->getUID(), $id);
		// convert the store entries to objects
		$proposalParticipants = new ProposalParticipantCollection();
		$proposalParticipants->fromStore($proposalParticipantEntries);
		$proposalDates = new ProposalDateCollection();
		$proposalDates->fromStore($proposalDateEntries);
		$proposalVotes = new ProposalVoteCollection();
		$proposalVotes->fromStore($proposalVoteEntries);
		// convert the proposal entry to a proposal object
		$proposal = new ProposalObject();
		$proposal->fromStore($proposalEntry);
		$proposal->setParticipants($proposalParticipants);
		$proposal->setDates($proposalDates);
		$proposal->setVotes($proposalVotes);

		return $proposal;
	}

	/**
	 * Fetch a proposal by a participant's unique token
	 */
	public function fetchByToken(string $token): ?ProposalObject {
		// Fetch the participant by token
		$participantEntry = $this->proposalParticipantMapper->fetchByToken($token);
		if ($participantEntry === null) {
			return null;
		}
		$user = $this->userManager->get($participantEntry->getUid());
		// retrieve full proposal with participants, dates, and votes
		$proposal = $this->fetchProposal($user, $participantEntry->getPid());

		return $proposal;
	}

	/**
	 * Create a new proposal
	 */
	public function createProposal(IUser $user, ProposalObject $proposal): ProposalObject {
		// determine if the proposal ID is null, as it should be for a new proposal
		if ($proposal->getId() !== null) {
			throw new \InvalidArgumentException('Proposal identifier must be null for a new proposal');
		}
		// store proposal
		$proposalEntry = $proposal->toStore();
		$proposalEntry->setUid($user->getUID());
		$proposalEntry->setUuid(Uuid::v4()->toRfc4122());
		$proposalEntry = $this->proposalMapper->insert($proposalEntry);
		// store participants
		foreach ($proposal->getParticipants() as $participant) {
			$entry = $participant->toStore();
			$entry->setUid($user->getUID());
			$entry->setPid($proposalEntry->getId());
			$entry->setToken(md5(random_bytes(32)));
			$this->proposalParticipantMapper->insert($entry);
		}
		// store dates
		foreach ($proposal->getDates() as $date) {
			$entry = $date->toStore();
			$entry->setUid($user->getUID());
			$entry->setPid($proposalEntry->getId());
			$this->proposalDateMapper->insert($entry);
		}
		// retrieve full proposal with participants, dates, and votes
		$proposal = $this->fetchProposal($user, $proposalEntry->getId());

		// generate notifications for internal and external participants
		$this->generateNotifications($user, $proposal, 'C');

		// generate iTip for internal participants
		$this->generateIMip($user, $proposal, 'C');

		return $proposal;
	}

	/**
	 * Modify an existing proposal
	 */
	public function modifyProposal(IUser $user, ProposalObject $mutatedProposal): ProposalObject {
		// determine if the proposal ID is set, as it should be for a modification
		if ($mutatedProposal->getId() === null) {
			throw new \InvalidArgumentException('Proposal identifier cannot be null for modification');
		}
		// retrieve the existing proposal
		$currentProposal = $this->fetchProposal($user, $mutatedProposal->getId());
		if ($currentProposal === null) {
			throw new \InvalidArgumentException('Proposal not found for identifier: ' . ($mutatedProposal->getId() ?? 'null'));
		}
		// convert and store proposal object
		$mutatedProposalEntry = $mutatedProposal->toStore();
		$mutatedProposalEntry->setId($currentProposal->getId());
		$mutatedProposalEntry->setUid($user->getUID());
		$this->proposalMapper->update($mutatedProposalEntry);
		// compare, convert and store participants objects
		$participantDelta = $currentProposal->getParticipants()->compare($mutatedProposal->getParticipants());
		foreach (['added', 'modified'] as $mutation) {
			foreach ($participantDelta[$mutation] as $participant) {
				$mutatedParticipantEntry = $participant->toStore();
				$mutatedParticipantEntry->setUid($user->getUID());
				$mutatedParticipantEntry->setPid($mutatedProposalEntry->getId());
				if ($mutation === 'modified') {
					$this->proposalParticipantMapper->update($mutatedParticipantEntry);
				} else {
					$mutatedParticipantEntry->setToken(md5(random_bytes(32)));
					$this->proposalParticipantMapper->insert($mutatedParticipantEntry);
				}
			}
		}
		foreach ($participantDelta['deleted'] as $participant) {
			$this->proposalParticipantMapper->deleteById($user->getUID(), $participant->getId());
		}
		// compare, convert and store dates objects
		$dateDelta = $currentProposal->getDates()->compare($mutatedProposal->getDates());
		foreach (['added', 'modified'] as $mutation) {
			foreach ($dateDelta[$mutation] as $date) {
				$mutatedDateEntry = $date->toStore();
				$mutatedDateEntry->setUid($user->getUID());
				$mutatedDateEntry->setPid($mutatedProposalEntry->getId());
				if ($mutation === 'modified') {
					$this->proposalDateMapper->update($mutatedDateEntry);
					$this->proposalVoteMapper->deleteByDateId($user->getUID(), $date->getId());
				} else {
					$this->proposalDateMapper->insert($mutatedDateEntry);
				}
			}
		}
		foreach ($dateDelta['deleted'] as $date) {
			$this->proposalVoteMapper->deleteByDateId($user->getUID(), $date->getId());
			$this->proposalDateMapper->deleteById($user->getUID(), $date->getId());
		}
		// retrieve full proposal with participants, dates, and votes
		$proposal = $this->fetchProposal($user, $mutatedProposalEntry->getId());

		// generate notifications for internal and external participants
		$this->generateNotifications($user, $proposal, 'M');

		// generate iTip for internal participants
		$this->generateIMip($user, $proposal, 'M');

		return $proposal;
	}

	/**
	 * Destroy a proposal
	 */
	public function destroyProposal(IUser $user, int $identifier): void {
		// retrieve full proposal with participants, dates, and votes
		$proposal = $this->fetchProposal($user, $identifier);
		if ($proposal === null) {
			throw new \InvalidArgumentException('Proposal not found');
		}
		// destroy the proposal entry
		$this->proposalVoteMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalParticipantMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalDateMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalMapper->deleteById($user->getUID(), $proposal->getId());

		// generate notifications for internal and external participants
		$this->generateNotifications($user, $proposal, 'D');

		// generate iTip for internal participants
		$this->generateIMip($user, $proposal, 'D');
	}

	/**
	 * Convert a selected proposal date into a calendar meeting.
	 */
	public function convertProposal(IUser $user, int $proposalId, int $dateId, array $options = []): void {
		// retrieve full proposal with participants, dates, and votes
		$proposal = $this->fetchProposal($user, $proposalId);
		if ($proposal === null) {
			throw new \InvalidArgumentException('Proposal not found');
		}
		// locate selected date
		$selectedDate = $proposal->getDates()->findById($dateId);
		if ($selectedDate === null) {
			throw new \InvalidArgumentException('Date not found for proposal');
		}

		// retrieve the primary calendar for the user
		// this condition is just to make psalm happy
		if (method_exists($this->calendarManager, 'getPrimaryCalendar')) {
			/** @var ICalendar&ICreateFromString|null $userCalendar */
			$userCalendar = $this->calendarManager->getPrimaryCalendar($user->getUID());
		}
		if ($userCalendar !== null && (!$userCalendar instanceof ICreateFromString || $userCalendar->isDeleted())) {
			$userCalendar = null;
		}
		// if no primary calendar is set, use the first useable calendar
		if ($userCalendar === null) {
			$userCalendars = $this->calendarManager->getCalendarsForPrincipal('principals/users/' . $user->getUID());
			foreach ($userCalendars as $calendar) {
				if ($calendar instanceof ICreateFromString && $calendar instanceof ICalendarIsWritable && $calendar->isWritable() && !$calendar->isDeleted()) {
					$userCalendar = $calendar;
					break;
				}
			}
		}
		if ($userCalendar === null) {
			throw new \RuntimeException('Could not find a useable calendar to create a meeting from the selected proposal');
		}

		// extract options
		// timezone option
		$eventTimezone = null;
		if (isset($options['timezone']) && is_string($options['timezone']) && in_array($options['timezone'], DateTimeZone::listIdentifiers(), true)) {
			if (!empty($options['timezone'])) {
				$eventTimezone = new DateTimeZone($options['timezone']);
			}
		}
		// participant attendance option
		$eventAttendancePreset = false;
		if (isset($options['attendancePreset']) && is_bool($options['attendancePreset'])) {
			$eventAttendancePreset = $options['attendancePreset'];
		}
		// talk room option
		$talkRoomUri = null;
		if (isset($options['talkRoomUri']) && is_string($options['talkRoomUri'])) {
			$talkRoomUri = $options['talkRoomUri'];
		}

		// build a VCalendar with single definitive event
		$vObject = new VCalendar();
		/** @var \Sabre\VObject\Component\VEvent $vEvent */
		$vEvent = $vObject->add('VEVENT', []);
		$vEvent->UID->setValue($proposal->getUuid() ?? Uuid::v4()->toRfc4122());
		$vEvent->add('DTSTART', $eventTimezone ? $selectedDate->getDate()->setTimezone($eventTimezone) : $selectedDate->getDate());
		$vEvent->add('DTEND', (clone $vEvent->DTSTART->getDateTime())->add(new \DateInterval("PT{$proposal->getDuration()}M")));
		$vEvent->add('SEQUENCE', 1);
		$vEvent->add('SUMMARY', $proposal->getTitle());
		$vEvent->add('DESCRIPTION', $proposal->getDescription());
		if ($talkRoomUri !== null) {
			$vEvent->add('LOCATION', $talkRoomUri);
		} elseif (!empty($proposal->getLocation())) {
			$vEvent->add('LOCATION', $proposal->getLocation());
		}
		$vEvent->add('ORGANIZER', 'mailto:' . $user->getEMailAddress(), ['CN' => $user->getDisplayName()]);
		foreach ($proposal->getParticipants() as $participant) {
			if ($participant->getAddress() === null) {
				continue;
			}
			$vEvent->add('ATTENDEE', 'mailto:' . $participant->getAddress(), [
				'CN' => $participant->getName(),
				'CUTYPE' => 'INDIVIDUAL',
				'PARTSTAT' => $eventAttendancePreset ? $this->convertProposalAttendeeAttendance($selectedDate, $participant, $proposal->getVotes()) : 'NEEDS-ACTION',
				'ROLE' => 'REQ-PARTICIPANT'
			]);
		}

		// store the calendar object
		$userCalendar->createFromString(
			Uuid::v4()->toRfc4122() . '.ics',
			$vObject->serialize()
		);

		// destroy the proposal entry
		$this->proposalVoteMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalParticipantMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalDateMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalMapper->deleteById($user->getUID(), $proposal->getId());
	}

	public function convertProposalAttendeeAttendance(ProposalDateObject $date, ProposalParticipantObject $participant, ProposalVoteCollection $votes): string {
		// find the vote for the given date and participant
		$vote = $votes->findByDateAndParticipant($date->getId(), $participant->getId());
		// convert the vote to an iCal PARTSTAT value
		if ($vote === null) {
			return 'NEEDS-ACTION';
		}
		return match ($vote->getVote()) {
			ProposalDateVote::Yes => 'ACCEPTED',
			ProposalDateVote::No => 'DECLINED',
			ProposalDateVote::Maybe => 'TENTATIVE',
			default => 'NEEDS-ACTION',
		};
	}

	public function deleteProposalsByUser(string $user): void {
		$this->proposalVoteMapper->deleteByUserId($user);
		$this->proposalParticipantMapper->deleteByUserId($user);
		$this->proposalDateMapper->deleteByUserId($user);
		$this->proposalMapper->deleteByUserId($user);
	}

	public function storeResponse(ProposalResponseObject $response): void {
		// retrieve the participant entry
		$participantEntry = $this->proposalParticipantMapper->fetchByToken($response->getToken());
		if ($participantEntry === null) {
			throw new \InvalidArgumentException('Participant not found for token: ' . $response->getToken());
		}
		// retrieve the proposal entry
		$proposalEntry = $this->proposalMapper->fetchById($participantEntry->getUid(), $participantEntry->getPid());
		if ($proposalEntry === null) {
			throw new \InvalidArgumentException('Proposal not found for identifier: ' . ($participantEntry->getPid() ?? 'null'));
		}
		// retrieve proposal dates
		$proposalDateEntries = $this->proposalDateMapper->fetchByProposalId($participantEntry->getUid(), $participantEntry->getPid());

		// first, delete any existing votes for this participant
		$this->proposalVoteMapper->deleteByParticipantId($participantEntry->getUid(), $participantEntry->getId());

		// find response dates that match the proposal dates and store votes
		$responseDates = $response->getDates();
		foreach ($responseDates as $responseDate) {
			$dateId = $responseDate->getId();
			$foundDateEntry = null;
			foreach ($proposalDateEntries as $proposalDateEntry) {
				if ($proposalDateEntry->getId() === $dateId) {
					$foundDateEntry = $proposalDateEntry;
					break;
				}
			}
			if ($foundDateEntry !== null) {
				// create and save vote entry directly
				$voteEntry = new \OCA\Calendar\Db\ProposalVoteEntry();
				$voteEntry->setUid($participantEntry->getUid());
				$voteEntry->setPid($participantEntry->getPid());
				$voteEntry->setParticipantId($participantEntry->getId());
				$voteEntry->setDateId($foundDateEntry->getId());
				$voteEntry->setVote($responseDate->getVote());
				$this->proposalVoteMapper->insert($voteEntry);
			}
		}

		// update participant status to responded
		$participantEntry->setStatus(ProposalParticipantStatus::Responded->value);
		$this->proposalParticipantMapper->update($participantEntry);
	}

	private function generateNotifications(IUser $user, ProposalObject $proposal, string $reason): void {
		// if the proposal has no dates or participants, we cannot generate any notifications
		if ($proposal->getDates()->count() === 0 || $proposal->getParticipants()->count() === 0) {
			return;
		}

		foreach ($proposal->getParticipants() as $participant) {
			$this->sendEmailNotifications($user, $proposal, $participant, $reason);
		}
	}

	private function sendEmailNotifications(IUser $user, ProposalObject $proposal, ProposalParticipantObject $participant, string $reason): void {
		// if the user has no configured email address, we cannot send notifications
		if (empty($user->getEMailAddress())) {
			return;
		}
		// if the participant has no email address, we cannot send notifications
		if (empty($participant->getAddress())) {
			return;
		}

		$senderAddress = $user->getEMailAddress();
		$senderName = $user->getDisplayName();
		$recipientAddress = $participant->getAddress();
		$recipientName = $participant->getName();
		$recipientToken = $participant->getToken();

		// Ensure we have valid string values for array keys
		if ($senderAddress === null || $recipientAddress === null) {
			return;
		}

		$template = $this->systemMailManager->createEMailTemplate('calendar.proposal.notification');
		$template->addHeader();

		// subject
		match ($reason) {
			'C' => $template->setSubject(
				$this->l10n->t('%s has proposed a meeting', [$senderName])
			),
			'M' => $template->setSubject(
				$this->l10n->t('%s has updated a proposed meeting', [$senderName])
			),
			'D' => $template->setSubject(
				$this->l10n->t('%s has canceled a proposed meeting', [$senderName])
			)
		};
		// heading
		match ($reason) {
			'C' => $template->addHeading(
				$this->l10n->t('Dear %s, a new meeting has been proposed', [$recipientName])
			),
			'M' => $template->addHeading(
				$this->l10n->t('Dear %s, a proposed meeting has been updated', [$recipientName])
			),
			'D' => $template->addHeading(
				$this->l10n->t('Dear %s, a proposed meeting has been cancelled', [$recipientName])
			)
		};
		// description
		if (!empty($proposal->getDescription())) {
			$template->addBodyListItem($proposal->getDescription(), $this->l10n->t('Description:'));
		}
		// location
		if (!empty($proposal->getLocation())) {
			$template->addBodyListItem($proposal->getLocation(), $this->l10n->t('Location:'));
		}
		// duration
		if ($proposal->getDuration() > 0) {
			$template->addBodyListItem((string)$proposal->getDuration() . ' minutes', $this->l10n->t('Duration:'));
		}
		// dates
		$temporaryText = '';
		foreach ($proposal->getDates()->sortByDate() as $date) {
			$dtStart = \DateTime::createFromImmutable($date->getDate());
			$dtEnd = (clone $dtStart)->add(new \DateInterval("PT{$proposal->getDuration()}M"));
			$textDate = $this->l10n->l('date', $dtStart, ['width' => 'long']);
			$textStart = $this->l10n->l('time', $dtStart, ['width' => 'short']);
			$textEnd = $this->l10n->l('time', $dtEnd, ['width' => 'short']);
			$temporaryText .= $this->l10n->t('%1$s from %2$s to %3$s', [$textDate, $textStart, $textEnd]) . "\n";
		}
		$template->addBodyListItem($temporaryText, $this->l10n->t('Dates:'));

		$template->addBodyButton(
			$this->l10n->t('Respond'),
			$this->urlGenerator->linkToRouteAbsolute('Calendar.ProposalPublic.index', ['token' => $recipientToken])
		);

		$template->addFooter();

		try {
			if ($this->appConfig->getValueBool('core', 'mail_providers_enabled', true)) {
				// retrieve appropriate service with the same address as sender
				$mailService = $this->userMailManager->findServiceByAddress($user->getUID(), $senderAddress);
			}
			// evaluate if a mail service was found and has sending capabilities
			if (isset($mailService) && $mailService instanceof IMessageSend) {
				// construct mail message and set required parameters
				// this condition is just to make psalm happy
				if (!method_exists($mailService, 'initiateMessage')) {
					throw new \RuntimeException('Mail service does not support message initiation');
				}
				$message = $mailService->initiateMessage();
				$message->setFrom(
					(new Address($senderAddress, $senderName))
				);
				$message->setTo(
					(new Address($recipientAddress, $recipientName))
				);
				$message->setSubject($template->renderSubject());
				$message->setBodyPlain($template->renderText());
				$message->setBodyHtml($template->renderHtml());
				// send message
				$mailService->sendMessage($message);
			} else {
				$fromAddress = \OCP\Util::getDefaultEmailAddress('proposal-noreply');
				// construct symfony mailer message and set required parameters
				$message = $this->systemMailManager->createMessage();
				$message->setFrom([$fromAddress => $senderName ?? '']);
				$message->setTo(
					$recipientName !== null ? [$recipientAddress => $recipientName] : [$recipientAddress]
				);
				$message->setReplyTo(
					$senderName !== null ? [$senderAddress => $senderName] : [$senderAddress]
				);
				$message->useTemplate($template);
				$failed = $this->systemMailManager->send($message);
			}
		} catch (Exception $e) {
			$this->logger->error($e->getMessage(), ['app' => 'calendar', 'exception' => $e]);
		}

	}

	private function generateIMip(IUser $user, ProposalObject $proposal, string $reason): void {
		// if the calendar manager does not have a handleIMip method, we cannot generate iTip messages
		if (!method_exists($this->calendarManager, 'handleIMip')) {
			return;
		}
		// if the proposal has no dates or participants, we cannot generate any iTip messages
		if ($proposal->getDates()->count() === 0 || $proposal->getParticipants()->count() === 0) {
			return;
		}
		// construct calendar object with events
		$template = new VCalendar();
		// TODO: change REQUEST to PUBLISH
		$template->add('METHOD', $reason !== 'D' ? 'REQUEST' : 'CANCEL');
		// create a event for each date in the proposal
		// TODO: should we create a new instance for each date or use a recurrence rule? Like RDATE:19970714T083000Z,19970715T083000Z
		foreach ($proposal->getDates()->sortByDate() as $proposalDate) {
			/** @var VEvent $vEvent */
			$vEvent = $template->add('VEVENT', []);
			if (isset($baseDate)) {
				$vEvent->add('RECURRENCE-ID', $baseDate->getDate()->format('Ymd\THis\Z'));
			} else {
				$baseDate = $proposalDate;
			}
			$vEvent->UID->setValue($proposal->getUuid());
			$vEvent->add('STATUS', 'TENTATIVE');
			$vEvent->add('SEQUENCE', 1);
			$vEvent->add('DTSTART', $proposalDate->getDate());
			$vEvent->add('DURATION', "PT{$proposal->getDuration()}M");
			$vEvent->add('SUMMARY', $proposal->getTitle());
			$vEvent->add('DESCRIPTION', $proposal->getDescription());
			$vEvent->add('ORGANIZER', 'mailto:' . $user->getEMailAddress(), ['CN' => $user->getDisplayName()]);
			// add the participant to the event
			foreach ($proposal->getParticipants() as $participant) {
				$vEvent->add('ATTENDEE', 'mailto:' . $participant->getAddress(), [
					'CN' => $participant->getName(),
					'CUTYPE' => 'INDIVIDUAL',
					'PARTSTAT' => 'NEEDS-ACTION',
					'ROLE' => 'REQ-PARTICIPANT'
				]);
			}
		}

		foreach ($proposal->getParticipants()->filterByRealm(ProposalParticipantRealm::Internal) as $participant) {
			$participantAddress = $participant->getAddress();
			if ($participantAddress === null) {
				continue;
			}

			// TODO: this is stupid, we send the internal users email address from the UI then convert it back to a user name
			// should probably be sent from the UI as a user name, or send and store both the user name and email address
			// maybe send the address as a special schema "local:{user name}/{email address}", this would allow us to later extend this to federated users
			// with a different special schema like "federated:{user name}@{server}/{email address}"
			$participantUsers = $this->userManager->getByEmail($participantAddress);
			if ($participantUsers === []) {
				continue;
			}
			$participantUser = $participantUsers[0];
			try {
				$this->calendarManager->handleIMip(
					$participantUser->getUID(),
					$template->serialize(),
					$reason !== 'D' ? ['absent' => 'create'] : []
				);
			} catch (Exception $e) {
				$this->logger->error($e->getMessage(), ['app' => 'calendar', 'exception' => $e]);
			}
		}

	}

}

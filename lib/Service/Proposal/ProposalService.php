<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service\Proposal;

use Exception;
use OCA\Calendar\Db\ProposalDateMapper;
use OCA\Calendar\Db\ProposalMapper;
use OCA\Calendar\Db\ProposalParticipantMapper;
use OCA\Calendar\Objects\Proposal\ProposalDateCollection;
use OCA\Calendar\Objects\Proposal\ProposalObject;
use OCA\Calendar\Objects\Proposal\ProposalParticipantCollection;
use OCA\Calendar\Objects\Proposal\ProposalParticipantObject;
use OCA\Calendar\Objects\Proposal\ProposalParticipantRealm;
use OCA\Calendar\Objects\Proposal\ProposalResponseObject;
use OCP\IAppConfig;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\Mail\IMailer;
use OCP\Mail\Provider\Address;
use OCP\Mail\Provider\IManager as IMailManager;
use OCP\Mail\Provider\IMessageSend;
use Psr\Log\LoggerInterface;

class ProposalService {

	public function __construct(
		private IAppConfig $appConfig,
		private LoggerInterface $logger,
		private ProposalMapper $proposalMapper,
		private ProposalParticipantMapper $proposalParticipantMapper,
		private ProposalDateMapper $proposalDateMapper,
		private IL10N $l10n,
		private IURLGenerator $urlGenerator,
		private IMailer $systemMailManager,
		private IMailManager $userMailManager,
	) {
	}

	public function listProposals(IUser $user): array {
		// retrieve all proposals, participants, and dates for the user
		$proposalEntries = $this->proposalMapper->fetchByUserId($user->getUID());
		$proposalParticipantEntries = $this->proposalParticipantMapper->fetchByUserId($user->getUID());
		$proposalDateEntries = $this->proposalDateMapper->fetchByUserId($user->getUID());
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
		// convert the store entries to objects
		$proposals = [];
		foreach ($proposalEntries as $proposalEntry) {
			// convert the store format to a proposal object
			$proposal = new ProposalObject();
			$proposal->fromStore($proposalEntry);
			// convert the participants and dates for this proposal
			$proposalParticipants = $proposal->getParticipants();
			if (isset($proposalParticipantEntries[$proposalEntry->getId()])) {
				$proposalParticipants->fromStore($proposalParticipantEntries[$proposalEntry->getId()]);
			}
			$proposalDates = $proposal->getDates();
			if (isset($proposalDateEntries[$proposalEntry->getId()])) {
				$proposalDates->fromStore($proposalDateEntries[$proposalEntry->getId()]);
			}
			// add the proposal to the list
			$proposals[] = $proposal;
		}
		
		return $proposals;
	}

	public function fetch(IUser $user, int $id): ?ProposalObject {
		// fetch the proposal entry by id
		$proposalEntry = $this->proposalMapper->fetchById($user->getUID(), $id);
		if ($proposalEntry === null) {
			return null;
		}
		// retrieve the participants and dates for this proposal
		$proposalParticipantEntries = $this->proposalParticipantMapper->fetchByProposalId($user->getUID(), $id);
		$proposalDateEntries = $this->proposalDateMapper->fetchByProposalId($user->getUID(), $id);
		// convert the store entries to objects
		$proposalParticipants = new ProposalParticipantCollection();
		$proposalParticipants->fromStore($proposalParticipantEntries);
		$proposalDates = new ProposalDateCollection();
		$proposalDates->fromStore($proposalDateEntries);
		// convert the proposal entry to a proposal object
		$proposal = new ProposalObject();
		$proposal->fromStore($proposalEntry);
		$proposal->setParticipants($proposalParticipants);
		$proposal->setDates($proposalDates);

		return $proposal;
	}

	/**
	 * Fetch a proposal by a participant's unique token
	 *
	 * @param string $token
	 * @return ProposalObject|null
	 */
	public function fetchByToken(string $token): ?ProposalObject {
		// Fetch the participant by token
		$participantEntry = $this->proposalParticipantMapper->fetchByToken($token);
		if ($participantEntry === null) {
			return null;
		}
		$pid = $participantEntry->getPid();
		$uid = $participantEntry->getUid();
		// Fetch the proposal entry by pid and uid
		$proposalEntry = $this->proposalMapper->fetchById($uid, $pid);
		if ($proposalEntry === null) {
			return null;
		}
		// retrieve the participants and dates for this proposal
		$proposalParticipantEntries = $this->proposalParticipantMapper->fetchByProposalId($uid, $pid);
		$proposalDateEntries = $this->proposalDateMapper->fetchByProposalId($uid, $pid);
		// convert the store entries to objects
		$proposalParticipants = new ProposalParticipantCollection();
		$proposalParticipants->fromStore($proposalParticipantEntries);
		$proposalDates = new ProposalDateCollection();
		$proposalDates->fromStore($proposalDateEntries);
		// convert the proposal entry to a proposal object
		$proposal = new ProposalObject();
		$proposal->fromStore($proposalEntry);
		// set the participants and dates
		$proposal->setParticipants($proposalParticipants);
		$proposal->setDates($proposalDates);

		return $proposal;
	}

	/**
	 * Create a new proposal
	 *
	 * @param IUser $user
	 * @param ProposalObject $proposal
	 * @return ProposalObject
	 */
	public function createProposal(IUser $user, ProposalObject $proposal): ProposalObject {
		// determine if the proposal ID is null, as it should be for a new proposal
		if ($proposal->getId() !== null) {
			throw new \InvalidArgumentException('Proposal identifier must be null for a new proposal');
		}
		// convert the proposal object to a storage format
		$proposalEntry = $proposal->toStore();
		$proposalEntry->setUid($user->getUID());
		$proposalParticipantEntries = $proposal->getParticipants()->toStore();
		$proposalDateEntries = $proposal->getDates()->toStore();
		// create the proposal entry in store
		$proposalEntry = $this->proposalMapper->insert($proposalEntry);
		// create the participants entries in store
		foreach ($proposalParticipantEntries as $key => $entry) {
			$entry->setUid($user->getUID());
			$entry->setPid($proposalEntry->getId());
			$entry->setToken(md5($proposalEntry->getId() . $entry->getAddress()));
			$proposalParticipantEntries[$key] = $this->proposalParticipantMapper->insert($entry);
		}
		// create the dates entries in store
		foreach ($proposalDateEntries as $key => $entry) {
			$entry->setUid($user->getUID());
			$entry->setPid($proposalEntry->getId());
			$proposalDateEntries[$key] = $this->proposalDateMapper->insert($entry);
		}
		// convert updated store entries to ProposalObject
		$proposalParticipants = new ProposalParticipantCollection();
		$proposalParticipants->fromStore($proposalParticipantEntries);
		$proposalDates = new ProposalDateCollection();
		$proposalDates->fromStore($proposalDateEntries);
		$proposal->fromStore($proposalEntry);
		$proposal->setParticipants($proposalParticipants);
		$proposal->setDates($proposalDates);

		unset($proposalEntry, $proposalParticipantEntries, $proposalDateEntries);
		unset($proposalParticipants, $proposalDates);

		// send email notifications to participants
		$this->generateNotifications($user, $proposal, 'C');

		return $proposal;
	}

	/**
	 * Modify an existing proposal
	 *
	 * @param ProposalObject $proposal
	 *
	 * @return ProposalObject
	 */
	public function modifyProposal(IUser $user, ProposalObject $proposal): ProposalObject {
		// determine if the proposal ID is set, as it should be for a modification
		if ($proposal->getId() === null) {
			throw new \InvalidArgumentException('Proposal identifier cannot be null for modification');
		}
		// retrieve the existing proposal
		$currentProposalEntry = $this->proposalMapper->fetchById($user->getUID(), $proposal->getId());
		if ($currentProposalEntry === null) {
			throw new \InvalidArgumentException('Proposal not found for identifier: ' . $proposal->getId());
		}
		// retrieve existing participants and dates
		$currentProposalParticipantEntries = $this->proposalParticipantMapper->fetchByProposalId($user->getUID(), $proposal->getId());
		$currentProposalDateEntries = $this->proposalDateMapper->fetchByProposalId($user->getUID(), $proposal->getId());
		// convert the proposal object to a storage format
		$mutatedProposalEntry = $proposal->toStore();
		$mutatedProposalParticipantEntries = $proposal->getParticipants()->toStore();
		$mutatedProposalDateEntries = $proposal->getDates()->toStore();
		// modify the proposal entry
		$mutatedProposalEntry->setId($currentProposalEntry->getId());
		$mutatedProposalEntry->setUid($user->getUID());
		$this->proposalMapper->update($mutatedProposalEntry);
		// create or modify participants entries
		foreach ($mutatedProposalParticipantEntries as $mutatedParticipantKey => $mutatedParticipantEntry) {
			// determine if the participant entry already exists
			$foundParticipantEntry = null;
			foreach ($currentProposalParticipantEntries as $currentParticipantKey => $currentParticipantEntry) {
				if ($currentParticipantEntry->getAddress() === $mutatedParticipantEntry->getAddress()) {
					$foundParticipantEntry = $currentParticipantEntry;
					unset($currentProposalParticipantEntries[$currentParticipantKey]);
					break;
				}
			}
			// create or modify the participant entry
			if ($foundParticipantEntry) {
				$mutatedProposalParticipantEntries[$mutatedParticipantKey] = $this->proposalParticipantMapper->update($mutatedParticipantEntry);
			} else {
				$mutatedParticipantEntry->setUid($user->getUID());
				$mutatedParticipantEntry->setPid($mutatedProposalEntry->getId());
				$mutatedProposalParticipantEntries[$mutatedParticipantKey] = $this->proposalParticipantMapper->insert($mutatedParticipantEntry);
			}
		}
		// delete remaining participants entries that were not modified
		foreach ($currentProposalParticipantEntries as $currentParticipantKey => $currentParticipantEntry) {
			$this->proposalParticipantMapper->deleteById($user->getUID(), $currentParticipantEntry->getId());
			unset($currentProposalParticipantEntries[$currentParticipantKey]);
		}
		// create or modify  date entries
		foreach ($mutatedProposalDateEntries as $mutatedDateKey => $mutatedDateEntry) {
			// determine if the date entry already exists
			$foundDateEntry = null;
			foreach ($currentProposalDateEntries as $currentDateKey => $currentDateEntry) {
				if ($currentDateEntry->getId() === $mutatedDateEntry->getId()) {
					$foundDateEntry = $currentDateEntry;
					unset($currentProposalDateEntries[$currentDateKey]);
					break;
				}
			}
			// create or modify the date entry
			if ($foundDateEntry) {
				$mutatedProposalDateEntries[$mutatedDateKey] = $this->proposalDateMapper->update($mutatedDateEntry);
			} else {
				$mutatedDateEntry->setUid($user->getUID());
				$mutatedDateEntry->setPid($mutatedProposalEntry->getId());
				$mutatedProposalDateEntries[$mutatedDateKey] = $this->proposalDateMapper->insert($mutatedDateEntry);
			}
		}
		// delete remaining date entries that were not modified
		foreach ($currentProposalDateEntries as $currentDateKey => $currentDateEntry) {
			$this->proposalDateMapper->deleteById($user->getUID(), $currentDateEntry->getId());
			unset($currentProposalDateEntries[$currentDateKey]);
		}

		// send email notifications to participants
		$this->generateNotifications($user, $proposal, 'M');

		return $proposal;
	}

	/**
	 * Destroy a proposal
	 *
	 * @param ProposalObject $proposal
	 * @return void
	 */
	public function destroyProposal(IUser $user, ProposalObject $proposal): void {
		if ($proposal->getId() === null) {
			throw new \InvalidArgumentException('Proposal ID cannot be null');
		}
		// destroy the proposal entry
		$this->proposalParticipantMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalDateMapper->deleteByProposalId($user->getUID(), $proposal->getId());
		$this->proposalMapper->deleteById($user->getUID(), $proposal->getId());

		// send email notifications to participants
		$this->generateNotifications($user, $proposal, 'D');

	}

	public function deleteProposalsByUser(string $user): void {
		$this->proposalParticipantMapper->deleteByUserId($user);
		$this->proposalDateMapper->deleteByUserId($user);
		$this->proposalMapper->deleteByUserId($user);
	}

	public function storeResponse(ProposalResponseObject $response): void {
		// retrieve the participant entry by token
		$participantEntry = $this->proposalParticipantMapper->fetchByToken($response->getToken());
		if ($participantEntry === null) {
			throw new \InvalidArgumentException('Participant not found for token: ' . $response->getToken());
		}
		// retrieve the proposal entry
		$proposalEntry = $this->proposalMapper->fetchById($participantEntry->getUid(), $participantEntry->getPid());
		if ($proposalEntry === null) {
			throw new \InvalidArgumentException('Proposal not found for identifier: ' . $participantEntry->getPid());
		}
		// retrieve proposal dates
		$proposalDateEntries = $this->proposalDateMapper->fetchByProposalId($participantEntry->getUid(), $participantEntry->getPid());
		// find response dates that match the proposal dates and update their votes
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
				// update the votes for the date entry
				match ($responseDate->getVote()) {
					'Y' => $foundDateEntry->setVotedYes($foundDateEntry->getVotedYes() + 1),
					'N' => $foundDateEntry->setVotedNo($foundDateEntry->getVotedNo() + 1),
					'M' => $foundDateEntry->setVotedMaybe($foundDateEntry->getVotedMaybe() + 1),
				};
				$this->proposalDateMapper->update($foundDateEntry);
			}
		}
	}

	private function generateNotifications(IUser $user, ProposalObject $proposal, string $reason): void {
		
		foreach ($proposal->getParticipants() as $participant) {
			if ($participant->getRealm() === ProposalParticipantRealm::External) {
				$this->sendEmailNotifications($user, $participant, $reason);
			} else {
				$this->sendEmailNotifications($user, $participant, $reason);
				// TODO: Should we also send internal notifications?
				// $this->sendPushNotifications($user, $proposal);
			}
		}
	}

	private function sendEmailNotifications(IUser $user, ProposalParticipantObject $participant, string $reason): void {

		// disabled for testing purposes
		//return;

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

		$template = $this->systemMailManager->createEMailTemplate('calendar.proposal.notification');
		$template->addHeader();
		$template->setSubject(
			$this->l10n->t('%s has proposed a meeting', [$senderName])
		);

		// Heading
		$template->addHeading(
			$this->l10n->t('Dear %s, please confirm your booking', [$recipientName])
		);
		
		$testLink = $this->urlGenerator->linkToRouteAbsolute('Calendar.ProposalPublic.index', ['token' => $recipientToken]);

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
			if ($mailService !== null && $mailService instanceof IMessageSend) {
				// construct mail message and set required parameters
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
				// construct symfony mailer message and set required parameters
				$message = $this->systemMailManager->createMessage();
				$message->setFrom([$senderAddress => $senderName]);
				$message->setTo(
					(($recipientName !== null) ? [$recipientAddress => $recipientName] : [$recipientAddress])
				);
				$message->setReplyTo(
					(($senderName !== null) ? [$senderAddress => $senderName] : [$senderAddress])
				);
				$message->useTemplate($template);
				$failed = $this->systemMailManager->send($message);
			}
		} catch (Exception $ex) {
			$this->logger->error($ex->getMessage(), ['exception' => $ex, 'app' => 'calendar-proposal']);
		}

	}

}

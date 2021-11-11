<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use DateTimeZone;
use OC\URLGenerator;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;
use OCP\DB\Exception;
use OCP\DB\Exception as DbException;
use OCP\Defaults;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\ILogger;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Security\ISecureRandom;
use OCP\Util;
use Sabre\VObject\Component\VEvent;

class BookingService {

	/** @var AvailabilityGenerator */
	private $availabilityGenerator;

	/** @var SlotExtrapolator */
	private $extrapolator;

	/** @var DailyLimitFilter */
	private $dailyLimitFilter;

	/** @var EventConflictFilter */
	private $eventConflictFilter;

	/** @var BookingCalendarWriter */
	private $calendarWriter;
	/** @var BookingMapper */
	private $bookingMapper;

	/** @var ISecureRandom */
	private $random;

	/** @var IMailer */
	private $mailer;

	/** @var IUserManager */
	private $userManager;
	/** @var IL10N */
	private $l10n;
	private $logger;
	private $urlGenerator;
	/** @var Defaults */
	private $defaults;
	/** @var IDateTimeFormatter */
	private $dateFormatter;
	/** @var IFactory */
	private $lFactory;

	public function __construct(AvailabilityGenerator $availabilityGenerator,
								SlotExtrapolator $extrapolator,
								DailyLimitFilter $dailyLimitFilter,
								EventConflictFilter $eventConflictFilter,
								BookingMapper $bookingMapper,
								BookingCalendarWriter $calendarWriter,
								ISecureRandom $random,
								IMailer $mailer,
								IUserManager $userManager,
								IL10N $l10n,
	Defaults $defaults,
	ILogger $logger,
	URLGenerator $urlGenerator,
								IDateTimeFormatter $dateFormatter,
	IFactory $lFactory) {

		$this->availabilityGenerator = $availabilityGenerator;
		$this->extrapolator = $extrapolator;
		$this->dailyLimitFilter = $dailyLimitFilter;
		$this->eventConflictFilter = $eventConflictFilter;
		$this->calendarWriter = $calendarWriter;
		$this->bookingMapper = $bookingMapper;
		$this->random = $random;
		$this->mailer = $mailer;
		$this->userManager = $userManager;
		$this->l10n = $l10n;
		$this->logger = $logger;
		$this->urlGenerator = $urlGenerator;
		$this->defaults = $defaults;
		$this->dateFormatter = $dateFormatter;
		$this->lFactory = $lFactory;
	}

	/**
	 * @param Booking $booking
	 * @param AppointmentConfig $config
	 * @return Booking
	 *
	 * @throws ClientException
	 */
	public function confirmBooking(Booking $booking, AppointmentConfig $config): Booking {
		$bookingSlot = current($this->getAvailableSlots($config, $booking->getStart(), $booking->getEnd()));

		if (!$bookingSlot) {
			throw new ClientException('Slot for booking is not available any more');
		}

		$tz = new DateTimeZone($booking->getTimezone());
		$startObj = (new DateTimeImmutable())->setTimestamp($booking->getStart())->setTimezone($tz);
		if(!$startObj) {
			throw new ClientException('Could not make sense of booking times');
		}

		// Pass the $startTimeInTz to get the correct timezone for the booking user
		$this->calendarWriter->write($config, $startObj, $booking->getDisplayName(), $booking->getEmail(), $booking->getDescription());

		return $booking;
	}

	/**
	 * @param AppointmentConfig $config
	 * @param int $start
	 * @param int $end
	 * @param string $timeZone
	 * @param string $displayName
	 * @param string $email
	 * @param string|null $description
	 *
	 * @return Booking
	 *
	 * @throws ClientException
	 * @throws ServiceException
	 */
	public function book(AppointmentConfig $config,int $start, int $end, string $timeZone, string $displayName, string $email, ?string $description = null): Booking {
		$bookingSlot = current($this->getAvailableSlots($config, $start, $end));

		if (!$bookingSlot) {
			throw new ClientException('Could not find slot for booking');
		}

		// this can move probably? run the booking logic, return slot, set that as start and end time for the new Booking obj?
		$booking = new Booking();
		$booking->setApptConfigId($config->getId());
		$booking->setCreatedAt(time());
		$booking->setToken($this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC));
		$booking->setDisplayName($displayName);
		$booking->setDescription($description);
		$booking->setEmail($email);
		$booking->setStart($start);
		$booking->setEnd($end);
		$booking->setTimezone($timeZone);
		try {
			$this->bookingMapper->insert($booking);
		} catch (Exception|ServiceException $e) {
			throw new ServiceException('Could not create booking', 0, $e);
		}
		return $booking;
	}

	/**
	 * @return Interval[]
	 */
	public function getAvailableSlots(AppointmentConfig $config, int $startTime, int $endTime): array {
		// 1. Build intervals at which slots may be booked
		$availabilityIntervals = $this->availabilityGenerator->generate($config, $startTime, $endTime);
		// 2. Generate all possible slots
		$allPossibleSlots = $this->extrapolator->extrapolate($config, $availabilityIntervals);
		// 3. Filter out the daily limits
		$filteredByDailyLimit = $this->dailyLimitFilter->filter($config, $allPossibleSlots);
		// 4. Filter out booking conflicts
		return $this->eventConflictFilter->filter($config, $filteredByDailyLimit);
	}

	// Update
	public function updateBooking() {
		// noop for now? we don't support a public update method at the moment
	}

	// Delete
	public function delete() {
		// this would be a cancel request to ICreateFromString::create()
	}

	/**
	 * @param Booking $booking
	 * @param AppointmentConfig $config
	 * @throws ServiceException
	 */
	public function sendConfirmationEmail(Booking $booking, AppointmentConfig $config) {
		$user = $this->userManager->get($config->getUserId());

		if($user === null) {
			throw new ServiceException('Could not find organizer');
		}

		$fromEmail = $user->getEMailAddress();
		$fromName = $user->getDisplayName();


		$instanceName = $this->defaults->getName();
		$sys = \OCP\Util::getDefaultEmailAddress($instanceName);
		$message = $this->mailer->createMessage()
			->setFrom([$sys => $fromName])
			->setTo([$booking->getEmail() => $booking->getDisplayName()])
			->setReplyTo([$fromEmail => $fromName]);


		$template = $this->mailer->createEMailTemplate('calendar.confirmAppointment');
		$template->addHeader();

		//Subject
		$subject = $this->l10n->t('Your Appointment "%s" needs confirmation', [$config->getName()]);
		$template->setSubject($subject);

		// Heading
		$summary = $this->l10n->t("Dear %s, please confirm your booking", [$booking->getDisplayName()]);
		$template->addHeading($summary);

		// Create Booking overview
		$this->addBulletList($template, $this->l10n, $booking, $config->getLocation());

		$bookingUrl = $this->urlGenerator->linkToRouteAbsolute('calendar.booking.confirmBooking', ['token' => $booking->getToken()]);
		$template->addBodyButton($this->l10n->t('Confirm'), $bookingUrl);

		$bodyText = $this->l10n->t('This confirmation link expires in 24 hours.');
		$template->addBodyText($bodyText);

		$bodyText = $this->l10n->t("If you wish to cancel the appointment after all, please contact your organizer:");
		$template->addBodyText($bodyText);
		$template->addBodyText($this->l10n->t("Message $fromEmail"));

		$template->addFooter();

		$message->useTemplate($template);


		try {
			$failed = $this->mailer->send($message);
			if ($failed) {
				$this->logger->error('Unable to deliver message to {failed}', ['app' => 'calendar', 'failed' => implode(', ', $failed)]);
			}
		} catch (\Exception $ex) {
			$this->logger->logException($ex, ['app' => 'calendar']);
		}
	}

	private function addBulletList(IEMailTemplate $template,
								   IL10N $l10n,
								   Booking $booking,
								   ?string $location = null):void {

		$template->addBodyListItem($booking->getDisplayName(), $l10n->t('Appointment:'));

		$l = $this->lFactory->findGenericLanguage();
		$relativeDateTime = $this->dateFormatter->formatDateTimeRelativeDay(
			$booking->getStart(),
			'long',
			'short',
			new \DateTimeZone($booking->getTimezone()),
			$this->lFactory->get('calendar',$l)
		);

		$template->addBodyListItem($relativeDateTime, $l10n->t('Date:'));

		if (isset($location)) {
			$template->addBodyListItem($location, $l10n->t('Where:'));
		}
		if ($booking->getDescription() !== null) {
			$template->addBodyListItem($booking->getDescription(), $l10n->t('Description:'));
		}
	}

	/**
	 * @param string $path
	 * @return string
	 */
	private function getAbsoluteImagePath(string $path):string {
		return $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->imagePath('core', $path)
		);
	}

	/**
	 * @param string $token
	 * @return Booking
	 * @throws ClientException
	 */
	public function findByToken(string $token): Booking {
		try {
			return $this->bookingMapper->findByToken($token);
		} catch (DoesNotExistException $e) {
			throw new ClientException(
				"Booking $token does not exist",
				0,
				$e,
				Http::STATUS_NOT_FOUND
			);
		}
	}

	/**
	 * @param $booking
	 * @throws DbException
	 */
	public function deleteEntity($booking) {
		$this->bookingMapper->delete($booking);
	}


}

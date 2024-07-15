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

use Exception;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Exception\ServiceException;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Notification\IManager;
use Psr\Log\LoggerInterface;
use function htmlspecialchars;
use function implode;

class MailService {
	/** @var IUserManager */
	private $userManager;
	/** @var IMailer */
	private $mailer;
	/** @var IL10N */
	private $l10n;
	/** @var Defaults */
	private $defaults;
	/** @var LoggerInterface */
	private $logger;
	/** @var IURLGenerator */
	private $urlGenerator;
	/** @var IDateTimeFormatter */
	private $dateFormatter;
	/** @var IFactory */
	private $lFactory;

	private IManager $notificationManager;

	public function __construct(IMailer $mailer,
		IUserManager $userManager,
		IL10N $l10n,
		Defaults $defaults,
		LoggerInterface $logger,
		IURLGenerator $urlGenerator,
		IDateTimeFormatter $dateFormatter,
		IFactory $lFactory,
		IManager $notificationManager,
		private IConfig $userConfig) {
		$this->userManager = $userManager;
		$this->mailer = $mailer;
		$this->l10n = $l10n;
		$this->defaults = $defaults;
		$this->logger = $logger;
		$this->urlGenerator = $urlGenerator;
		$this->dateFormatter = $dateFormatter;
		$this->lFactory = $lFactory;
		$this->notificationManager = $notificationManager;
	}

	/**
	 * @param Booking $booking
	 * @param AppointmentConfig $config
	 * @throws ServiceException
	 */
	public function sendConfirmationEmail(Booking $booking, AppointmentConfig $config): void {

		$user = $this->userManager->get($config->getUserId());

		if ($user === null) {
			throw new ServiceException('Could not find organizer');
		}

		$fromEmail = $user->getEMailAddress();
		if ($fromEmail === null) {
			throw new ServiceException('Organizer has no email set');
		}
		$fromName = $user->getDisplayName();

		$sys = $this->getSysEmail();
		$message = $this->mailer->createMessage()
			->setFrom([$sys => $fromName])
			->setTo([$booking->getEmail() => $booking->getDisplayName()])
			->setReplyTo([$fromEmail => $fromName]);


		$template = $this->mailer->createEMailTemplate('calendar.confirmAppointment');
		$template->addHeader();

		//Subject
		$subject = $this->l10n->t('Your appointment "%s" with %s needs confirmation', [$config->getName(),  $user->getDisplayName()]);
		$template->setSubject($subject);

		// Heading
		$summary = $this->l10n->t("Dear %s, please confirm your booking", [$booking->getDisplayName()]);
		$template->addHeading($summary);

		$bookingUrl = $this->urlGenerator->linkToRouteAbsolute('calendar.booking.confirmBooking', ['token' => $booking->getToken()]);
		$template->addBodyButton($this->l10n->t('Confirm'), $bookingUrl);

		$template->addBodyListItem($user->getDisplayName(), 'Appointment with:');
		if (!empty($config->getDescription())) {
			$template->addBodyListItem($config->getDescription(), 'Description:');
		}

		// Create Booking overview
		$this->addBulletList($template, $this->l10n, $booking, $config);

		$bodyText = $this->l10n->t('This confirmation link expires in %s hours.', [(BookingService::EXPIRY / 3600)]);
		$template->addBodyText($bodyText);

		$bodyText = $this->l10n->t('If you wish to cancel the appointment after all, please contact your organizer by replying to this email or by visiting their profile page.');
		$template->addBodyText($bodyText);

		$template->addFooter();

		$message->useTemplate($template);


		try {
			$failed = $this->mailer->send($message);
			if (count($failed) > 0) {
				$this->logger->warning('Mail delivery failed for some recipients.', ['app' => 'calendar-appointments']);
				foreach ($failed as $fail) {
					$this->logger->debug('Failed to deliver email to ' . $fail, ['app' => 'calendar-appointments']);
				}
				throw new ServiceException('Could not send mail for recipient(s) ' . implode(', ', $failed));
			}
		} catch (Exception $ex) {
			$this->logger->error($ex->getMessage(), ['exception' => $ex, 'app' => 'calendar-appointments']);
			throw new ServiceException('Could not send mail: ' . $ex->getMessage(), $ex->getCode(), $ex);
		}
	}

	/**
	 * @param Booking $booking
	 * @param AppointmentConfig $config
	 * @throws ServiceException
	 */
	public function sendBookingInformationEmail(Booking $booking, AppointmentConfig $config, string $calendar): void {
		$user = $this->userManager->get($config->getUserId());

		if ($user === null) {
			throw new ServiceException('Could not find organizer');
		}

		$fromEmail = $user->getEMailAddress();
		if ($fromEmail === null) {
			throw new ServiceException('Organizer has no email set');
		}
		$fromName = $user->getDisplayName();

		$sys = $this->getSysEmail();
		$message = $this->mailer->createMessage()
			->setFrom([$sys => $fromName])
			->setTo([$booking->getEmail() => $booking->getDisplayName()])
			->setReplyTo([$fromEmail => $fromName]);


		$template = $this->mailer->createEMailTemplate('calendar.confirmAppointment');
		$template->addHeader();

		// Subject
		$subject = $this->l10n->t('Your appointment "%s" with %s has been accepted', [$config->getName(), $user->getDisplayName()]);
		$template->setSubject($subject);

		// Heading
		$summary = $this->l10n->t('Dear %s, your booking has been accepted.', [$booking->getDisplayName()]);
		$template->addHeading($summary);

		$template->addBodyListItem($user->getDisplayName(), 'Appointment with:');
		if (!empty($config->getDescription())) {
			$template->addBodyListItem($config->getDescription(), 'Description:');
		}

		// Create Booking overview
		$this->addBulletList($template, $this->l10n, $booking, $config);

		$bodyText = $this->l10n->t('If you wish to cancel the appointment after all, please contact your organizer by replying to this email or by visiting their profile page.');
		$template->addBodyText($bodyText);

		$template->addFooter();

		$attachment = $this->mailer->createAttachment($calendar, "appointment.ics", "text/calendar");
		$message->attach($attachment);
		$message->useTemplate($template);


		try {
			$failed = $this->mailer->send($message);
			if (count($failed) > 0) {
				$this->logger->warning('Mail delivery failed for some recipients.', ['app' => 'calendar-appointments']);
				foreach ($failed as $fail) {
					$this->logger->debug('Failed to deliver email to ' . $fail, ['app' => 'calendar-appointments']);
				}
				throw new ServiceException('Could not send mail for recipient(s) ' . implode(', ', $failed));
			}
		} catch (Exception $ex) {
			$this->logger->error($ex->getMessage(), ['exception' => $ex, 'app' => 'calendar-appointments']);
			throw new ServiceException('Could not send mail: ' . $ex->getMessage(), $ex->getCode(), $ex);
		}
	}

	private function addBulletList(IEMailTemplate $template,
		IL10N $l10n,
		Booking $booking,
		AppointmentConfig $config): void {
		$template->addBodyListItem($booking->getDisplayName(), $l10n->t('Appointment for:'));

		$l = $this->lFactory->findGenericLanguage();
		$relativeDateTime = $this->dateFormatter->formatDateTimeRelativeDay(
			$booking->getStart(),
			'long',
			'short',
			new \DateTimeZone($booking->getTimezone()),
			$this->lFactory->get('calendar', $l)
		);

		$template->addBodyListItem($relativeDateTime, $l10n->t('Date:'));

		if (!$booking->isConfirmed() && $config->getCreateTalkRoom()) {
			$template->addBodyListItem($l10n->t('You will receive a link with the confirmation email'), $l10n->t('Where:'));
		} elseif (!$booking->isConfirmed() && !empty($config->getLocation())) {
			$template->addBodyListItem($config->getLocation(), $l10n->t('Where:'));
		} elseif ($booking->isConfirmed() && $booking->getTalkUrl() !== null) {
			$template->addBodyListItem(
				'<a href="' . htmlspecialchars($booking->getTalkUrl()) . '">' . $booking->getTalkUrl() . '</a>',
				$l10n->t('Where:'),
				'',
				$booking->getTalkUrl(),
			);
		} elseif ($booking->isConfirmed() && !empty($config->getLocation())) {
			$template->addBodyListItem($config->getLocation(), $l10n->t('Where:'));
		}

		if (!empty($booking->getDescription())) {
			$template->addBodyListItem($booking->getDescription(), $l10n->t('Comment:'));
		}
	}

	/**
	 * @return string
	 */
	private function getSysEmail(): string {
		$instanceName = $this->defaults->getName();
		return \OCP\Util::getDefaultEmailAddress('appointments-noreply');
	}

	public function sendOrganizerBookingInformationEmail(Booking $booking, AppointmentConfig $config, string $calendar): void {
		/** @var IUser $user */
		$user = $this->userManager->get($config->getUserId());
		if ($user === null) {
			throw new ServiceException('Could not find organizer');
		}

		$toEmail = $user->getEMailAddress();
		if ($toEmail === null) {
			throw new ServiceException('Organizer has no email set');
		}
		$toName = $user->getDisplayName();

		$sys = $this->getSysEmail();
		$message = $this->mailer->createMessage()
			->setFrom([$sys => $booking->getDisplayName()])
			->setTo([$toEmail => $toName]);


		$template = $this->mailer->createEMailTemplate('calendar.confirmOrganizer');
		$template->addHeader();

		$lang = $this->userConfig->getUserValue($user->getUID(), 'core', 'lang', null);
		$l10n = $this->lFactory->get('calendar', $lang);
		// Subject
		$subject = $l10n->t('You have a new appointment booking "%s" from %s', [$config->getName(), $booking->getDisplayName()]);
		$template->setSubject($subject);

		// Heading
		$summary = $l10n->t('Dear %s, %s (%s) booked an appointment with you.', [$user->getDisplayName(), $booking->getDisplayName(), $booking->getEmail()]);
		$template->addHeading($summary);

		$template->addBodyListItem($booking->getDisplayName() . ' (' . $booking->getEmail() . ')', 'Appointment with:');
		if (!empty($config->getDescription())) {
			$template->addBodyListItem($config->getDescription(), 'Description:');
		}

		// Create Booking overview
		$this->addBulletList($template, $l10n, $booking, $config);
		$template->addFooter();

		$attachment = $this->mailer->createAttachment($calendar, 'appointment.ics', 'text/calendar');
		$message->attach($attachment);
		$message->useTemplate($template);


		try {
			$failed = $this->mailer->send($message);
			if (count($failed) > 0) {
				$this->logger->warning('Mail delivery failed for some recipients.', ['app' => 'calendar-appointments']);
				foreach ($failed as $fail) {
					$this->logger->debug('Failed to deliver email to ' . $fail, ['app' => 'calendar-appointments']);
				}
				throw new ServiceException('Could not send mail for recipient(s) ' . implode(', ', $failed));
			}
		} catch (Exception $ex) {
			$this->logger->error('Could not send appointment organizer email: ' . $ex->getMessage(), ['exception' => $ex, 'app' => 'calendar-appointments']);
			throw new ServiceException('Could not send mail: ' . $ex->getMessage(), $ex->getCode(), $ex);
		}
	}

	public function sendOrganizerBookingInformationNotification(Booking $booking, AppointmentConfig $config) {
		$relativeDateTime = $this->dateFormatter->formatDateTimeRelativeDay(
			$booking->getStart(),
			'long',
			'short',
			new \DateTimeZone($booking->getTimezone()),
			$this->lFactory->get('calendar')
		);

		$notification = $this->notificationManager->createNotification();
		$notification
			->setApp('calendar')
			->setUser($config->getUserId())
			->setObject('booking', (string) $booking->getId())
			->setSubject('booking_accepted',
				[
					'type' => 'highlight',
					'id' => $booking->getId(),
					'name' => $config->getName(),
					'link' => $config->getPrincipalUri()
				])
			->setDateTime(new \DateTime())
			->setMessage('booking_accepted_message',
				[
					'type' => 'highlight',
					'id' => $booking->getId(),
					'display_name' => $booking->getDisplayName(),
					'config_display_name' => $config->getName(),
					'link' => $config->getPrincipalUri(),
					'email' => $booking->getEmail(),
					'date_time' => $relativeDateTime
				]
			);
		$this->notificationManager->notify($notification);
	}
}

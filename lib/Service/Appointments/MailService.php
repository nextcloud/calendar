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
use OC\URLGenerator;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Exception\ServiceException;
use OCP\Defaults;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use Psr\Log\LoggerInterface;
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
	/** @var URLGenerator */
	private $urlGenerator;
	/** @var IDateTimeFormatter */
	private $dateFormatter;
	/** @var IFactory */
	private $lFactory;

	public function __construct(IMailer            $mailer,
								IUserManager       $userManager,
								IL10N              $l10n,
								Defaults           $defaults,
								LoggerInterface            $logger,
								URLGenerator       $urlGenerator,
								IDateTimeFormatter $dateFormatter,
								IFactory           $lFactory) {
		$this->userManager = $userManager;
		$this->mailer = $mailer;
		$this->l10n = $l10n;
		$this->defaults = $defaults;
		$this->logger = $logger;
		$this->urlGenerator = $urlGenerator;
		$this->dateFormatter = $dateFormatter;
		$this->lFactory = $lFactory;
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
		$fromName = $user->getDisplayName();


		$sys = $this->getSysEmail();
		$message = $this->mailer->createMessage()
			->setFrom([$sys => $fromName])
			->setTo([$booking->getEmail() => $booking->getDisplayName()])
			->setReplyTo([$fromEmail => $fromName]);


		$template = $this->mailer->createEMailTemplate('calendar.confirmAppointment');
		$template->addHeader();

		//Subject
		$subject = $this->l10n->t('Your appointment "%s" needs confirmation', [$config->getName()]);
		$template->setSubject($subject);

		// Heading
		$summary = $this->l10n->t("Dear %s, please confirm your booking", [$booking->getDisplayName()]);
		$template->addHeading($summary);

		// Create Booking overview
		$this->addBulletList($template, $this->l10n, $booking, $config->getLocation());

		$bookingUrl = $this->urlGenerator->linkToRouteAbsolute('calendar.booking.confirmBooking', ['token' => $booking->getToken()]);
		$template->addBodyButton($this->l10n->t('Confirm'), $bookingUrl);

		$bodyText = $this->l10n->t('This confirmation link expires in %s hours.', [(BookingService::EXPIRY / 3600)]);
		$template->addBodyText($bodyText);

		$bodyText = $this->l10n->t("If you wish to cancel the appointment after all, please contact your organizer.");
		$template->addBodyText($bodyText);

		$template->addFooter();

		$message->useTemplate($template);


		try {
			$failed = $this->mailer->send($message);
			if (count($failed) > 0) {
				$this->logger->warning('Mail delivery failed for some recipients.');
				foreach ($failed as $fail) {
					$this->logger->debug('Failed to deliver email to ' . $fail);
				}
				throw new ServiceException('Could not send mail for recipient(s) ' . implode(', ', $failed));
			}
		} catch (Exception $ex) {
			$this->logger->error($ex->getMessage(), ['exception' => $ex]);
			throw new ServiceException('Could not send mail: ' . $ex->getMessage(), $ex->getCode(), $ex);
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

		if (!empty($location)) {
			$template->addBodyListItem($location, $l10n->t('Where:'));
		}
		if (!empty($booking->getDescription())) {
			$template->addBodyListItem($booking->getDescription(), $l10n->t('Description:'));
		}
	}

	/**
	 * @return string
	 */
	private function getSysEmail(): string {
		$instanceName = $this->defaults->getName();
		return \OCP\Util::getDefaultEmailAddress('appointments-noreply');
	}
}

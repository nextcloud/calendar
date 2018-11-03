<?php
/**
 * @author Thomas Citharel <tcit@tcit.fr>
 *
 * @copyright Copyright (c) 2016 Thomas Citharel <tcit@tcit.fr>
 * @license GNU AGPL version 3 or any later version
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\Mail\IMailer;

class EmailController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var Defaults
	 */
	private $defaults;

	/**
	 * @var IL10N
	 */
	private $l10n;

	/**
	 * @var IMailer
	 */
	private $mailer;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 * @param IMailer $mailer
	 * @param IL10N $l10N
	 * @param Defaults $defaults
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IConfig $config, IMailer $mailer, IL10N $l10N, Defaults $defaults) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
		$this->mailer = $mailer;
		$this->l10n = $l10N;
		$this->defaults = $defaults;
	}

	/**
	 * @param string $recipient
	 * @param string $url
	 * @param string $calendarName
	 * @return JSONResponse
	 * @NoAdminRequired
	 */
	public function sendEmailPublicLink($recipient, $url, $calendarName) {
		$user = $this->userSession->getUser();
		$displayName = $user->getDisplayName();

		$subject = $this->l10n->t('%s has published the calendar »%s«', [$displayName, $calendarName]);

		$serverVersion = $this->config->getSystemValue('version');
		if (version_compare($serverVersion, '12', '>=')) {
			$emailTemplate = $this->mailer->createEMailTemplate('calendar.PublicShareNotification', [
				'recipient' => $recipient,
				'displayname' => $displayName,
				'calendar_name' => $calendarName,
				'calendar_url' => $url,
			]);

			$emailTemplate->addHeader();
			$emailTemplate->addHeading($this->l10n->t('%s has published the calendar »%s«', [$displayName, $calendarName]));

			$emailTemplate->addBodyText($this->l10n->t('Hello,'));
			$emailTemplate->addBodyText($this->l10n->t('We wanted to inform you that %s has published the calendar »%s«.', [$displayName, $calendarName]));

			$emailTemplate->addBodyButton($this->l10n->t('Open »%s«', [$calendarName]), $url);

			// TRANSLATORS term at the end of a mail
			$emailTemplate->addBodyText($this->l10n->t('Cheers!'));

			$emailTemplate->addFooter();

			$bodyHTML = $emailTemplate->renderHtml();
			$textBody = $emailTemplate->renderText();
		} else {
			$emailTemplateHTML = new TemplateResponse('calendar', 'mail.publication.html', [
				'subject' => $subject,
				'username' => $displayName,
				'calendarname' => $calendarName,
				'calendarurl' => $url,
				'defaults' => $this->defaults
			], 'public');
			$bodyHTML = $emailTemplateHTML->render();

			$emailTemplateText = new TemplateResponse('calendar', 'mail.publication.text', [
				'subject' => $subject,
				'username' => $displayName,
				'calendarname' => $calendarName,
				'calendarurl' => $url
			], 'blank');
			$textBody = $emailTemplateText->render();
		}

		$status = $this->sendEmail($recipient, $subject, $bodyHTML, $textBody);

		return new JSONResponse([], $status);
	}

	/**
	 * @param string $recipient
	 * @param string $subject
	 * @param string $body
	 * @param string $textBody
	 * @return int
	 */
	private function sendEmail($recipient, $subject, $body, $textBody) {
		if (!$this->mailer->validateMailAddress($recipient)) {
			return Http::STATUS_BAD_REQUEST;
		}

		$sendFromDomain = $this->config->getSystemValue('mail_domain', 'domain.org');
		$sendFromAddress = $this->config->getSystemValue('mail_from_address', 'nextcloud');
		$sendFrom = $sendFromAddress . '@' . $sendFromDomain;

		$message = $this->mailer->createMessage();
		$message->setSubject($subject);
		$message->setFrom([$sendFrom => $this->defaults->getName()]);
		$message->setTo([$recipient => $this->l10n->t('Recipient')]);
		$message->setPlainBody($textBody);
		$message->setHtmlBody($body);
		$this->mailer->send($message);

		return Http::STATUS_OK;
	}
}

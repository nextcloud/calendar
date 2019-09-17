<?php
/**
 * @author Thomas Citharel
 * @author Georg Ehrke
 *
 * @copyright 2016 Thomas Citharel <tcit@tcit.fr>
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
 *
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
use OCP\Defaults;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Mail\IMessage;

/**
 * Class EmailController
 *
 * @package OCA\Calendar\Controller
 */
class EmailController extends Controller {

	/** @var IConfig */
	private $config;

	/** @var Defaults */
	private $defaults;

	/** @var IL10N */
	private $l10n;

	/** @var IMailer */
	private $mailer;

	/** @var IUserSession */
	private $userSession;

	/** @var IURLGenerator */
	private $urlGenerator;

	/**
	 * EmailController constructor.
	 *
	 * @param $appName
	 * @param IRequest $request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 * @param IMailer $mailer
	 * @param IL10N $l10N
	 * @param Defaults $defaults
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct(string $appName,
								IRequest $request,
								IUserSession $userSession,
								IConfig $config,
								IMailer $mailer,
								IL10N $l10N,
								Defaults $defaults,
								IURLGenerator $urlGenerator) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
		$this->mailer = $mailer;
		$this->l10n = $l10N;
		$this->defaults = $defaults;
		$this->urlGenerator = $urlGenerator;
	}

	/**
	 * @param string $recipient
	 * @param string $token
	 * @param string $calendarName
	 * @return JSONResponse
	 *
	 * @UserRateThrottle(limit=5, period=100)
	 *
	 * @NoAdminRequired
	 */
	public function sendEmailPublicLink(string $recipient,
										string $token,
										string $calendarName):JSONResponse {
		$user = $this->userSession->getUser();
		if (!$user) {
			return new JSONResponse([
				'message' => $this->l10n->t('User-Session unexpectedly expired'),
			], Http::STATUS_UNAUTHORIZED);
		}

		if (!$this->mailer->validateMailAddress($recipient)) {
			return new JSONResponse([
				'message' => $this->l10n->t('Provided email-address is not valid'),
			], Http::STATUS_BAD_REQUEST);
		}

		$fromAddress = $this->getFromAddress();
		$displayName = $user->getDisplayName();
		$subject = $this->l10n->t('%s has published the calendar »%s«', [$displayName, $calendarName]);

		$template = $this->createTemplate($subject, $displayName, $calendarName, $token);
		$message = $this->createMessage($fromAddress, [$recipient => $recipient], $template);

		try {
			$this->mailer->send($message);
		} catch(\Exception $ex) {
			return new JSONResponse([
				'message' => $this->l10n->t('Unexpected error sending email. Please contact your administrator.'),
			], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse([
			'message' => $this->l10n->t('Successfully sent email to ' . $recipient),
		]);
	}

	/**
	 * Get the from address
	 *
	 * @return string
	 */
	private function getFromAddress():string {
		$sendFromDomain = $this->config->getSystemValue('mail_domain', 'domain.org');
		$sendFromAddress = $this->config->getSystemValue('mail_from_address', 'nextcloud');

		return implode('@', [
			$sendFromAddress,
			$sendFromDomain
		]);
	}

	/**
	 * @param string $from
	 * @param array $recipients
	 * @param IEMailTemplate $template
	 * @return IMessage
	 */
	private function createMessage(string $from,
								   array $recipients,
								   IEMailTemplate $template):IMessage {
		$message = $this->mailer->createMessage();
		$message->setFrom([$from => $this->defaults->getName()]);
		$message->setTo($recipients);
		$message->useTemplate($template);

		return $message;
	}

	/**
	 * @param string $subject
	 * @param string $displayName
	 * @param string $calendarName
	 * @param string $token
	 * @return IEMailTemplate
	 */
	private function createTemplate(string $subject,
									string $displayName,
									string $calendarName,
									string $token):IEMailTemplate {
		$url = $this->getURLFromToken($token);
		$emailTemplate = $this->mailer->createEMailTemplate('calendar.PublicShareNotification', [
			'displayname' => $displayName,
			'calendar_name' => $calendarName,
			'calendar_url' => $url,
		]);

		$emailTemplate->setSubject($subject);

		$emailTemplate->addHeader();
		$emailTemplate->addHeading($this->l10n->t('%s has published the calendar »%s«', [$displayName, $calendarName]));
		$emailTemplate->addBodyText($this->l10n->t('Hello,'));
		$emailTemplate->addBodyText($this->l10n->t('We wanted to inform you that %s has published the calendar »%s«.', [$displayName, $calendarName]));
		$emailTemplate->addBodyButton($this->l10n->t('Open »%s«', [$calendarName]), $url);
		// TRANSLATORS term at the end of a mail
		$emailTemplate->addBodyText($this->l10n->t('Cheers!'));
		$emailTemplate->addFooter();

		return $emailTemplate;
	}

	/**
	 * Get URL from public sharing token
	 *
	 * @param string $token
	 * @return string
	 */
	private function getURLFromToken(string $token):string {
		return $this->urlGenerator->linkToRouteAbsolute('calendar.view.public_index_with_branding', [
			'token' => $token,
		]);
	}
}

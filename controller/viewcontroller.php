<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @author Raghu Nayyar
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\NotFoundResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\Mail\IMailer;
use OCP\IURLGenerator;

class ViewController extends Controller {

	/**
	 * @var IURLGenerator
	 */
	private $urlGenerator;

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @var IMailer
	 */
	private $mailer;

	/**
	 * @var IL10N
	 */
	private $l10n;

	/**
	 * @var Defaults
	 */
	private $defaults;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 * @param IMailer $mailer
	 * @param IL10N $l10N
	 * @param Defaults $defaults
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IConfig $config, IMailer $mailer, IL10N $l10N,
								Defaults $defaults, IURLGenerator $urlGenerator) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
		$this->mailer = $mailer;
		$this->l10n = $l10N;
		$this->defaults = $defaults;
		$this->urlGenerator = $urlGenerator;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index() {
		$runningOn = $this->config->getSystemValue('version');
		$runningOnNextcloud10OrLater = version_compare($runningOn, '9.1', '>=');

		$supportsClass = $runningOnNextcloud10OrLater;
		$assetPipelineBroken = !$runningOnNextcloud10OrLater;

		$isAssetPipelineEnabled = $this->config->getSystemValue('asset-pipeline.enabled', false);
		if ($isAssetPipelineEnabled && $assetPipelineBroken) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$user = $this->userSession->getUser();
		$userId = $user->getUID();
		$emailAddress = $user->getEMailAddress();

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');
		$initialView = $this->config->getUserValue($userId, $this->appName, 'currentView', null);
		$skipPopover = $this->config->getUserValue($userId, $this->appName, 'skipPopover', 'no');
		$weekNumbers = $this->config->getUserValue($userId, $this->appName, 'showWeekNr', 'no');
		$firstRun = $this->config->getUserValue($userId, $this->appName, 'firstRun', null);
		$defaultColor = $this->config->getAppValue('theming', 'color', '#0082C9');

		// the default view will be saved as soon as a user
		// opens the calendar app, therefore this is a good
		// indication if the calendar was used before
		if ($firstRun === null) {
			if ($initialView === null) {
				$firstRun = 'yes';
			} else {
				$this->config->setUserValue($userId, $this->appName, 'firstRun', 'no');
				$firstRun = 'no';
			}
		}

		if ($initialView === null) {
			$initialView = 'month';
		}
		
		$webCalWorkaround = $runningOnNextcloud10OrLater ? 'no' : 'yes';

		return new TemplateResponse('calendar', 'main', [
			'appVersion' => $appVersion,
			'initialView' => $initialView,
			'emailAddress' => $emailAddress,
			'skipPopover' => $skipPopover,
			'weekNumbers' => $weekNumbers,
			'firstRun' => $firstRun,
			'supportsClass' => $supportsClass,
			'defaultColor' => $defaultColor,
			'webCalWorkaround' => $webCalWorkaround,
			'isPublic' => false,
		]);
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function publicIndex() {
		$runningOn = $this->config->getSystemValue('version');
		$runningOnServer91OrLater = version_compare($runningOn, '9.1', '>=');

		$supportsClass = $runningOnServer91OrLater;
		$assetPipelineBroken = !$runningOnServer91OrLater;

		$isAssetPipelineEnabled = $this->config->getSystemValue('asset-pipeline.enabled', false);
		if ($isAssetPipelineEnabled && $assetPipelineBroken) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');

		$response = new TemplateResponse('calendar', 'main', [
			'appVersion' => $appVersion,
			'initialView' => 'month',
			'emailAddress' => '',
			'supportsClass' => $supportsClass,
			'firstRun' => 'no',
			'isPublic' => true,
			'shareURL' => $this->request->getServerProtocol() . '://' . $this->request->getServerHost() . $this->request->getRequestUri(),
			'previewImage' => $this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('core', 'favicon-touch.png')),
		], 'public');
		$response->addHeader('X-Frame-Options', 'ALLOW');
		$csp = new ContentSecurityPolicy();
		$csp->addAllowedScriptDomain('*');
		$response->setContentSecurityPolicy($csp);

		return $response;
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param string $id
	 * @return NotFoundResponse|DataDisplayResponse
	 */
	public function getTimezone($id) {
		if (!in_array($id, $this->getTimezoneList())) {
			return new NotFoundResponse();
		}

		$tzData = file_get_contents(__DIR__ . '/../timezones/' . $id);

		return new DataDisplayResponse($tzData, Http::STATUS_OK, [
			'content-type' => 'text/calendar',
		]);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @PublicPage
	 *
	 * @param $region
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithRegion($region, $city) {
		return $this->getTimezone($region . '-' . $city);
	}


	/**
	 * @NoAdminRequired
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param $region
	 * @param $subregion
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithSubRegion($region, $subregion, $city) {
		return $this->getTimezone($region . '-' . $subregion . '-' . $city);
	}


	/**
	 * get a list of default timezones
	 *
	 * @return array
	 */
	private function getTimezoneList() {
		$allFiles = scandir(__DIR__ . '/../timezones/');

		return array_values(array_filter($allFiles, function($file) {
			return (substr($file, -4) === '.ics');
		}));
	}

	/**
	 * @param string $to
	 * @param string $url
	 * @param string $name
	 * @return JSONResponse
	 * @NoAdminRequired
	 */
	public function sendEmailPublicLink($to, $url, $name) {

		$user = $this->userSession->getUser();
		$username = $user->getDisplayName();

		$subject = $this->l10n->t('%s has published the calendar "%s"', [$username, $name]);

		$emailTemplateHTML = new TemplateResponse('calendar', 'mail.publication.html', ['subject' => $subject, 'username' => $username, 'calendarname' => $name, 'calendarurl' => $url, 'defaults' => $this->defaults], 'public');
		$bodyHTML = $emailTemplateHTML->render();
		$emailTemplateText = new TemplateResponse('calendar', 'mail.publication.text', ['subject' => $subject, 'username' => $username, 'calendarname' => $name, 'calendarurl' => $url], 'blank');
		$textBody = $emailTemplateText->render();

		$status = $this->sendEmail($to, $subject, $bodyHTML, $textBody);

		return new JSONResponse([], $status);
	}

	/**
	 * @param string $target
	 * @param string $subject
	 * @param string $body
	 * @param string $textBody
	 * @return int
	 */
	private function sendEmail($target, $subject, $body, $textBody) {
		if (!$this->mailer->validateMailAddress($target)) {
			return Http::STATUS_BAD_REQUEST;
		}

		$sendFromDomain = $this->config->getSystemValue('mail_domain', 'domain.org');
		$sendFromAddress = $this->config->getSystemValue('mail_from_address', 'nextcloud');
		$sendFrom = $sendFromAddress . '@' . $sendFromDomain;

		$message = $this->mailer->createMessage();
		$message->setSubject($subject);
		$message->setFrom([$sendFrom => $this->defaults->getName()]);
		$message->setTo([$target => 'Recipient']);
		$message->setPlainBody($textBody);
		$message->setHtmlBody($body);
		$this->mailer->send($message);

		return Http::STATUS_OK;
	}
}

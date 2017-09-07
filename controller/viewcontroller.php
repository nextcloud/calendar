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

use OC\AppFramework\Http\Request;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\IURLGenerator;
use OCP\IL10N;
use OCP\L10N\IFactory;

class ViewController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IURLGenerator
	 */
	private $urlGenerator;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @var IFactory
	 */
	private $l10nFactory;

	// TODO(artur): Duplicate: Refactor Language --> NC:Server:PersonalInfo.php
	const COMMON_LANGUAGE_CODES = [
		'en', 'es', 'fr', 'de', 'de_DE', 'ja', 'ar', 'ru', 'nl', 'it',
		'pt_BR', 'pt_PT', 'da', 'fi_FI', 'nb_NO', 'sv', 'tr', 'zh_CN', 'ko'
	];

	/**
	 * @var [type]
	 */
	private $l;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 * @param IURLGenerator $urlGenerator
	 * @param IFactory $l10nFactory
	 * @param IL10N $l
	 */
	public function __construct(
		$appName,
		IRequest $request,
		IUserSession $userSession,
		IConfig $config,
		IURLGenerator $urlGenerator,
		IFactory $l10nFactory,
		IL10N $l
	) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
		$this->urlGenerator = $urlGenerator;
		$this->l10nFactory = $l10nFactory;
		$this->l = $l;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index() {
		$templateParameters = $this->getTemplateParams();

		$user = $this->userSession->getUser();
		$userId = $user->getUID();
		$emailAddress = $user->getEMailAddress();

		$initialView = $this->config->getUserValue($userId, $this->appName, 'currentView', null);
		$skipPopover = $this->config->getUserValue($userId, $this->appName, 'skipPopover', 'no');
		$weekNumbers = $this->config->getUserValue($userId, $this->appName, 'showWeekNr', 'no');
		$firstRun = $this->config->getUserValue($userId, $this->appName, 'firstRun', null);

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

		// TODO(artur): Duplicate: Refactor Language --> NC:Server:PersonalInfo.php
		$forceLanguage = $this->config->getSystemValue('force_language', false);
		if($forceLanguage !== false) {
			return [];
		}

		$userLang = $this->config->getUserValue($userId, 'core', 'lang', $this->l10nFactory->findLanguage());
		$languageCodes = $this->l10nFactory->findAvailableLanguages();

		$commonLanguages = [];
		$languages = [];

		foreach($languageCodes as $lang) {
			$l = \OC::$server->getL10N('settings', $lang);
			// TRANSLATORS this is the language name for the language switcher in the personal settings and should be the localized version
			$potentialName = (string) $l->t('__language_name__');
			if($l->getLanguageCode() === $lang && substr($potentialName, 0, 1) !== '_') {//first check if the language name is in the translation file
				$ln = array('code' => $lang, 'name' => $potentialName);
			} elseif ($lang === 'en') {
				$ln = ['code' => $lang, 'name' => 'English (US)'];
			}else{//fallback to language code
				$ln=array('code'=>$lang, 'name'=>$lang);
			}

			// put appropriate languages into appropriate arrays, to print them sorted
			// used language -> common languages -> divider -> other languages
			if ($lang === $userLang) {
				$userLang = $ln;
			} elseif (in_array($lang, self::COMMON_LANGUAGE_CODES)) {
				$commonLanguages[array_search($lang, self::COMMON_LANGUAGE_CODES)]=$ln;
			} else {
				$languages[]=$ln;
			}
		}

		// if user language is not available but set somehow: show the actual code as name
		if (!is_array($userLang)) {
			$userLang = [
				'code' => $userLang,
				'name' => $userLang,
			];
		}

		ksort($commonLanguages);

		// sort now by displayed language not the iso-code
		usort( $languages, function ($a, $b) {
			if ($a['code'] === $a['name'] && $b['code'] !== $b['name']) {
				// If a doesn't have a name, but b does, list b before a
				return 1;
			}
			if ($a['code'] !== $a['name'] && $b['code'] === $b['name']) {
				// If a does have a name, but b doesn't, list a before b
				return -1;
			}
			// Otherwise compare the names
			return strcmp($a['name'], $b['name']);
		});

		return new TemplateResponse('calendar', 'main', array_merge($templateParameters, [
			'initialView' => $initialView,
			'emailAddress' => $emailAddress,
			'skipPopover' => $skipPopover,
			'weekNumbers' => $weekNumbers,
			'firstRun' => $firstRun,
			'isPublic' => false,
			'isEmbedded' => false,
			'token' => '',
			'activelanguage' => $userLang,
			'commonlanguages' => $commonLanguages,
			'languages' => $languages
		]));
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexWithBranding($token) {
		$templateParameters = $this->getTemplateParams();
		$publicTemplateParameters = $this->getPublicTemplateParameters($token);
		$params = array_merge($templateParameters, $publicTemplateParameters);
		$params['isEmbedded'] = false;

		return new TemplateResponse('calendar', 'public', $params, 'base');
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexWithBrandingAndFancyName($token) {
		return $this->publicIndexWithBranding($token);
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexForEmbedding($token) {
		$templateParameters = $this->getTemplateParams();
		$publicTemplateParameters = $this->getPublicTemplateParameters($token);
		$params = array_merge($templateParameters, $publicTemplateParameters);
		$params['isEmbedded'] = true;

		$response = new TemplateResponse('calendar', 'main', $params, 'public');

		$response->addHeader('X-Frame-Options', 'ALLOW');
		$csp = new ContentSecurityPolicy();
		$csp->addAllowedScriptDomain('*');
		$response->setContentSecurityPolicy($csp);

		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexForEmbeddingLegacy($token) {
		return $this->publicIndexForEmbedding($token);
	}

	/**
	 * get common parameters used for all three routes
	 * @return array
	 */
	private function getTemplateParams() {
		$runningOn = $this->config->getSystemValue('version');
		$runningOnNextcloud12OrLater = version_compare($runningOn, '12', '>=');

		$shareeCanEditShares = !$runningOnNextcloud12OrLater;
		$shareeCanEditCalendarProperties = $runningOnNextcloud12OrLater;

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');
		$isIE = $this->request->isUserAgent([Request::USER_AGENT_IE]);
		$defaultColor = $this->config->getAppValue('theming', 'color', '#0082C9');
		$canSharePublicLink = $this->config->getAppValue('core', 'shareapi_allow_links', 'yes');

		return [
			'appVersion' => $appVersion,
			'isIE' => $isIE,
			'defaultColor' => $defaultColor,
			'shareeCanEditShares' => $shareeCanEditShares ? 'yes' : 'no',
			'shareeCanEditCalendarProperties' => $shareeCanEditCalendarProperties ? 'yes' : 'no',
			'canSharePublicLink' => $canSharePublicLink,
		];
	}

	/**
	 * get common parameters for public sites
	 * @param string $token
	 * @return array
	 */
	private function getPublicTemplateParameters($token) {
		$shareURL = $this->request->getServerProtocol() . '://';
		$shareURL .= $this->request->getServerHost();
		$shareURL .= $this->request->getRequestUri();

		$relativeImagePath = $this->urlGenerator->imagePath('core', 'favicon-touch.png');
		$previewImage = $this->urlGenerator->getAbsoluteURL($relativeImagePath);

		$remoteBase = $this->urlGenerator->linkTo('', 'remote.php');
		$remoteBase .= '/dav/public-calendars/' . $token . '?export';

		$downloadUrl = $this->urlGenerator->getAbsoluteURL($remoteBase);

		$protocolLength = strlen($this->request->getServerProtocol()) + 3;
		$webcalUrl = 'webcal://' . substr($downloadUrl, $protocolLength);

		return [
			'initialView' => 'month',
			'emailAddress' => '',
			'skipPopover' => 'no',
			'weekNumbers' => 'no',
			'firstRun' => 'no',
			'isPublic' => true,
			'shareURL' => $shareURL,
			'previewImage' => $previewImage,
			'webcalURL' => $webcalUrl,
			'downloadURL' => $downloadUrl,
			'token' => $token,
		];
	}
}

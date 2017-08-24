<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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
use OCP\AppFramework\Http\JSONResponse;
use OCP\Contacts\IManager;
use OCP\IConfig;
use OCP\IRequest;
use OCP\L10N\IFactory;

class ContactController extends Controller {

	/**
	 * API for contacts api
	 * @var IManager
	 */
	private $contacts;

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IFactory
	 */
	private $l10nFactory;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IManager $contacts
	 * @param IConfig $config
	 * @param IFactory $l10nFactory
	 */
	public function __construct($appName,
								IRequest $request,
								IManager $contacts,
								IConfig $config,
								IFactory $l10nFactory) {
		parent::__construct($appName, $request);
		$this->contacts = $contacts;
		$this->config = $config;
		$this->l10nFactory = $l10nFactory;
	}


	/**
	 * @param string $location
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function searchLocation($location) {
		$result = $this->contacts->search($location, ['FN', 'ADR']);

		$contacts = [];
		foreach ($result as $r) {
			if (!isset($r['ADR'])) {
				continue;
			}

			$name = $this->getNameFromContact($r);
			if (is_string($r['ADR'])) {
				$r['ADR'] = [$r['ADR']];
			}

			foreach ($r['ADR'] as $address) {
				$address = trim(preg_replace("/\n+/", "\n", str_replace(';', "\n", $address)));
				$contacts[] = [
					'label' => $address,
					'name' => $name
				];
			}
		}

		return new JSONResponse($contacts);
	}


	/**
	 * @param string $search
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function searchAttendee($search) {
		$result = $this->contacts->search($search, ['FN', 'EMAIL']);

		$defaultLang = $this->l10nFactory->findLanguage();
		$contacts = [];
		foreach ($result as $r) {
			if (!isset($r['EMAIL'])) {
				continue;
			}

			$name = $this->getNameFromContact($r);
			if (is_string($r['EMAIL'])) {
				$r['EMAIL'] = [$r['EMAIL']];
			}

			$lang = $this->getPreferredLanguageFromUidOrDefault($r['UID'], $defaultLang);
			$isLocalUser = isset($r['isLocalSystemBook']) && $r['isLocalSystemBook'];

			$contacts[] = [
					'email' => $r['EMAIL'],
					'name' => $name,
					'lang' => $lang,
					'is_local_user' => $isLocalUser
			];
		}

		return new JSONResponse($contacts);
	}


	/**
	 * Extract name from an array containing a contact's information
	 *
	 * @param array $r
	 * @return string
	 */
	private function getNameFromContact(array $r) {
		$name = '';
		if (isset($r['FN'])) {
			$name = $r['FN'];
		}

		return $name;
	}

	/**
	 * Returns the preferred language of a given user uid or $default instead
	 *
	 * @param string $uid
	 * @param string $default
	 * @return string
	 */
	private function getPreferredLanguageFromUidOrDefault($uid, $default) {
		return $this->config->getUserValue($uid, 'core', 'lang', $default);
	}
}

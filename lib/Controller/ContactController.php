<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Jakob Röhrl
 * @author Christoph Wurst
 *
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2019 Jakob Röhrl <jakob.roehrl@web.de>
 * @copyright 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
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
use OCP\AppFramework\Http\JSONResponse;
use OCP\Contacts\IManager;
use OCP\IRequest;
use OCP\IURLGenerator;

/**
 * Class ContactController
 *
 * @package OCA\Calendar\Controller
 */
class ContactController extends Controller {

	/**
	 * API for contacts
	 *
	 * @var IManager
	 */
	private $contactsManager;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IManager $contacts
	 */
	public function __construct(string $appName,
								IRequest $request,
								IManager $contacts) {
		parent::__construct($appName, $request);
		$this->contactsManager = $contacts;
	}

	/**
	 * @param string $location
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function searchLocation(string $location):JSONResponse {
		if (!$this->contactsManager->isEnabled()) {
			return new JSONResponse();
		}

		$result = $this->contactsManager->search($location, ['FN', 'ADR']);

		$contacts = [];
		foreach ($result as $r) {
			// Information about system users is fetched via DAV nowadays
			if (isset($r['isLocalSystemBook']) && $r['isLocalSystemBook']) {
				continue;
			}

			if (!isset($r['ADR'])) {
				continue;
			}

			$name = $this->getNameFromContact($r);
			if (\is_string($r['ADR'])) {
				$r['ADR'] = [$r['ADR']];
			}

			$photo = isset($r['PHOTO'])
				? $this->getPhotoUri($r['PHOTO'])
				: null;

			$addresses = [];
			foreach ($r['ADR'] as $address) {
				$addresses[] = trim(preg_replace("/\n+/", "\n", str_replace(';', "\n", $address)));
			}

			$contacts[] = [
				'name' => $name,
				'addresses' => $addresses,
				'photo' => $photo,
			];
		}

		return new JSONResponse($contacts);
	}


	/**
	 * @param string $search
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function searchAttendee(string $search):JSONResponse {
		if (!$this->contactsManager->isEnabled()) {
			return new JSONResponse();
		}

		$result = $this->contactsManager->search($search, ['FN', 'EMAIL']);

		$contacts = [];
		foreach ($result as $r) {
			// Information about system users is fetched via DAV nowadays
			if (isset($r['isLocalSystemBook']) && $r['isLocalSystemBook']) {
				continue;
			}

			if (!isset($r['EMAIL'])) {
				continue;
			}

			$name = $this->getNameFromContact($r);
			if (\is_string($r['EMAIL'])) {
				$r['EMAIL'] = [$r['EMAIL']];
			}

			$photo = isset($r['PHOTO'])
				? $this->getPhotoUri($r['PHOTO'])
				: null;

			$lang = null;
			if (isset($r['LANG'])) {
				if (\is_array($r['LANG'])) {
					$lang = $r['LANG'][0];
				} else {
					$lang = $r['LANG'];
				}
			}

			$timezoneId = null;
			if (isset($r['TZ'])) {
				if (\is_array($r['TZ'])) {
					$timezoneId = $r['TZ'][0];
				} else {
					$timezoneId = $r['TZ'];
				}
			}

			$contacts[] = [
				'name' => $name,
				'emails' => $r['EMAIL'],
				'lang' => $lang,
				'tzid' => $timezoneId,
				'photo' => $photo,
			];
		}

		return new JSONResponse($contacts);
	}

	/**
	 * @param string $search
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function searchPhoto(string $search):JSONResponse {
		if (!$this->contactsManager->isEnabled()) {
			return new JSONResponse([], Http::STATUS_NOT_FOUND);
		}

		$result = $this->contactsManager->search($search, ['EMAIL']);

		foreach ($result as $r) {
			if (!isset($r['EMAIL'])) {
				continue;
			}

			if (\is_string($r['EMAIL'])) {
				$r['EMAIL'] = [$r['EMAIL']];
			}

			$match = false;
			foreach($r['EMAIL'] as $email) {
				if ($email === $search) {
					$match = true;
				}
			}

			if (!$match) {
				continue;
			}

			if (!isset($r['PHOTO'])) {
				continue;
			}

			$name = $this->getNameFromContact($r);
			$photo = $this->getPhotoUri($r['PHOTO']);
			if (!$photo) {
				continue;
			}

			return new JSONResponse([
				'name' => $name,
				'photo' => $photo,
			]);
		}

		return new JSONResponse([], Http::STATUS_NOT_FOUND);
	}

	/**
	 * Extract name from an array containing a contact's information
	 *
	 * @param array $r
	 * @return string
	 */
	private function getNameFromContact(array $r):string {
		return $r['FN'] ?? '';
	}

	/**
	 * Get photo uri from contact
	 *
	 * @param string $raw
	 * @return string|null
	 */
	private function getPhotoUri(string $raw):?string {
		$uriPrefix = 'VALUE=uri:';
		if (substr($raw, 0, strlen($uriPrefix)) === $uriPrefix) {
			return substr($raw, strpos($raw, 'http'));
		}

		return null;
	}
}

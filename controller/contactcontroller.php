<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Davide Saurino
 * @copyright 2013 Davide Saurino <davide.saurino@alcacoop.it>
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

use OCP\AppFramework\Http\JSONResponse;
use OCP\Contacts\IManager;
use OCP\IRequest;
use OCP\IUserSession;

class ContactController extends Controller {

	/**
	 * API for contacts api
	 * @var IManager
	 */
	private $contacts;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IManager $contacts
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IManager $contacts) {
		parent::__construct($appName, $request, $userSession);
		$this->contacts = $contacts;
	}


	/**
	 * @param string $location
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function searchLocation($location) {
		$books = $this->contacts->getAddressBooks();
		foreach($books as $book) {
		}









		return;
		$result = $this->contacts->search($location, ['FN', 'ADR']);

		$contacts = [];
		foreach ($result as $r) {
			if (!isset($r['ADR'])) {
				continue;
			}

			$name = $this->getName($r);

			foreach ($r['ADR'] as $address) {
				$address = trim(implode(" ", $address));
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
	 * @NoCSRFRequired
	 */
	public function searchAttendee($search) {
		$result = $this->contacts->search($search, ['FN', 'EMAIL']);

		$contacts = [];
		foreach ($result as $r) {
			if (!isset($r['EMAIL'])) {
				continue;
			}

			$name = $this->getName($r);

			foreach ($r['EMAIL'] as $email) {
				$contacts[] = [
					'email' => $email,
					'name' => $name
				];
			}
		}

		return new JSONResponse($contacts);
	}


	/**
	 * Extract name from an array containing a contact's information
	 *
	 * @param array $r
	 * @return string
	 */
	private function getName(array $r) {
		$name = '';
		if (isset($r['FN'])) {
			$name = $r['FN'];
		}

		return $name;
	}
}
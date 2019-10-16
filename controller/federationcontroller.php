<?php
/**
 * @copyright Copyright (c) 2018 Bjoern Schiessle <bjoern@schiessle.org>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Controller;

use OCP\AppFramework\Controller;
use OCP\Federation\ICloudFederationFactory;
use OCP\Federation\ICloudFederationProviderManager;
use OCP\Federation\ICloudIdManager;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\Security\ISecureRandom;

class FederationController extends Controller {

	/** @var ICloudIdManager */
	private $cloudIdManager;

	/** @var ICloudFederationProviderManager */
	private $federationProviderManager;

	/** @var ICloudFederationFactory */
	private $cloudFederationFactory;

	/** @var ISecureRandom */
	private $secureRandom;

	/** @var \OCP\IUser */
	private $user;

	public function __construct(string $appName,
								IRequest $request,
								ICloudIdManager $cloudIdManager,
								ICloudFederationProviderManager $federationProviderManager,
								ICloudFederationFactory $cloudFederationFactory,
								ISecureRandom $secureRandom,
								IUserSession $userSession) {
		parent::__construct($appName, $request);

		$this->cloudIdManager = $cloudIdManager;
		$this->federationProviderManager = $federationProviderManager;
		$this->cloudFederationFactory = $cloudFederationFactory;
		$this->secureRandom = $secureRandom;
		$this->user = $userSession->getUser();
	}

	/**
	 * @param string $url (should be the subscriber url, e.g. webcal://nextcloudserver/remote.php/dav/public-calendars/fkhskfhksf?export)
	 * @param string $calendarName
	 * @param string $recipient (the federated cloud ID of the recipient)
	 * @return bool
	 */
	public function createFederatedShare(string $url, string $calendarName, string $recipient) {
		if (!$this->cloudIdManager->isValidCloudId($recipient)) {
			return false;
		}

		$sharedSecret = $this->generateSharedSecret();

		// ToDo store share in a db table
		$providerId =$this->addShareToDb($url, $calendarName, $recipient, $sharedSecret, $this->user->getUID());

		$share = $this->cloudFederationFactory->getCloudFederationShare(
			$recipient,
			$calendarName,
			'',
			$providerId,
			$this->user->getCloudId(),
			$this->user->getCloudId(),
			$this->user->getCloudId(),
			$this->user->getCloudId(),
			$sharedSecret,
			'user',
			'calendar');

		$share->setProtocol([
			'name' => 'carddav',
			'options' => [
				'sharedSecret' => $sharedSecret,
				'url' => $url
			]
		]);

		$this->federationProviderManager->sendShare($share);
	}

	/**
	 * generate to token used to authenticate federated shares
	 *
	 * @return string
	 */
	private function generateSharedSecret() {
		$token = $this->secureRandom->generate(15,
			ISecureRandom::CHAR_LOWER . ISecureRandom::CHAR_UPPER . ISecureRandom::CHAR_DIGITS);
		return $token;
	}

	/**
	 * write share to a database table
	 *
	 * @param $url
	 * @param $calendarName
	 * @param $recipient
	 * @param $sharedSecret
	 * @param $owner
	 * @return int
	 */
	private function addShareToDb(string $url,
								  string $calendarName,
								  string $recipient,
								  string $sharedSecret,
								  string $owner) {

		// Todo We still need to define a table for it and then write it to the table


		// ToDo should be the insert ID
		return 1;
	}

}

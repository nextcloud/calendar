<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use Exception;
use OCA\Calendar\Service\ServiceException;
use OCA\Circles\Api\v1\Circles;
use OCA\Circles\Exceptions\CircleNotFoundException;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\QueryException;
use OCP\Contacts\IManager;
use OCP\IRequest;
use OCP\IUserManager;
use Psr\Log\LoggerInterface;

/**
 * Class ContactController
 *
 * @package OCA\Calendar\Controller
 */
class ContactController extends Controller {
	/** @var IManager */
	private $contactsManager;

	/** @var IAppManager */
	private $appManager;

	/** @var IUserManager */
	private $userManager;

	/**
	 * ContactController constructor.
	 *
	 * @param string $appName
	 * @param IRequest $request
	 * @param IManager $contacts
	 */
	public function __construct(string $appName,
		IRequest $request,
		IManager $contacts,
		IAppManager $appManager,
		IUserManager $userManager,
		private LoggerInterface $logger,
	) {
		parent::__construct($appName, $request);
		$this->contactsManager = $contacts;
		$this->appManager = $appManager;
		$this->userManager = $userManager;
	}

	/**
	 * Search for a location based on a contact's name or address
	 *
	 * @param string $search Name or address to search for
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function searchLocation(string $search):JSONResponse {
		if (!$this->contactsManager->isEnabled()) {
			return new JSONResponse();
		}

		$result = $this->contactsManager->search($search, ['FN', 'ADR']);

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
	 * Search for a contact based on a contact's name or email-address
	 *
	 * @param string $search Name or email to search for
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
	 * Query members of a circle by circleId
	 *
	 * @param string $circleId CircleId to query for members
	 * @return JSONResponse
	 * @throws Exception
	 *
	 * @NoAdminRequired
	 */
	public function getCircleMembers(string $circleId):JSONResponse {
		if (!class_exists('\OCA\Circles\Api\v1\Circles') || !$this->appManager->isEnabledForUser('circles')) {
			$this->logger->debug('Circles not enabled');
			return new JSONResponse();
		}
		if (!$this->contactsManager->isEnabled()) {
			$this->logger->debug('Contacts not enabled');
			return new JSONResponse();
		}

		try {
			$circle = Circles::detailsCircle($circleId, true);
		} catch (QueryException $ex) {
			$this->logger->error('Could not resolve circle details', ['exception' => $ex]);
			return new JSONResponse();
		} catch (CircleNotFoundException $ex) {
			$this->logger->error('Could not find circle', ['exception' => $ex]);
			return new JSONResponse();
		}

		$circleMembers = $circle->getInheritedMembers();

		$contacts = [];
		foreach ($circleMembers as $circleMember) {
			if ($circleMember->isLocal()) {

				$circleMemberUserId = $circleMember->getUserId();

				$user = $this->userManager->get($circleMemberUserId);

				if ($user === null) {
					$this->logger->error('Could not find user with user id' . $circleMemberUserId);
					throw new ServiceException('Could not find circle member');
				}

				$contacts[] = [
					'commonName' => $circleMember->getDisplayName(),
					'calendarUserType' => 'INDIVIDUAL',
					'email' => $user->getEMailAddress(),
					'isUser' => true,
					'avatar' => $circleMemberUserId,
					'hasMultipleEMails' => false,
					'dropdownName' => $circleMember->getDisplayName(),
					'member' => 'mailto:circle+' . $circleId . '@' . $circleMember->getInstance(),
				];
			}
		}

		return new JSONResponse($contacts);
	}


	/**
	 * Get a contact's photo based on their email-address
	 *
	 * @param string $search Exact email-address to match
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
			foreach ($r['EMAIL'] as $email) {
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

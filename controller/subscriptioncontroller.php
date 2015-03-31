<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ISubscription;
use OCP\IRequest;

use OCA\Calendar\Backend\Exception as BackendException;
use OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer;
use OCA\Calendar\Http\JSON\JSONSubscriptionReader;
use OCA\Calendar\Http\JSON\JSONSubscriptionResponse;
use OCA\Calendar\Http\ReaderException;
use OCP\IUserSession;

class SubscriptionController extends Controller {

	/**
	 * BusinessLayer for managing backends
	 * @var SubscriptionBusinessLayer
	 */
	protected $subscriptions;


	/**
	 * Collection of initialized backends
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param SubscriptionBusinessLayer $subscriptions
	 * @param IBackendCollection $backends
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								SubscriptionBusinessLayer $subscriptions,
								IBackendCollection $backends) {
		parent::__construct($appName, $request, $userSession);
		$this->subscriptions = $subscriptions;
		$this->backends = $backends;

		$this->registerReader('json', function($handle) {
			$reader = new JSONSubscriptionReader($handle);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) {
			return new JSONSubscriptionResponse($value);
		});
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			return $this->subscriptions->findAll(
				$this->userId,
				$limit,
				$offset
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show($id) {
		try {
			return $this->subscriptions->find(
				$id,
				$this->userId
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create() {
		try {
			$subscription = $this->readInput();

			if (!($subscription instanceof ISubscription)) {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			$subscription->setUserId($this->userId);
			$this->validateSubscription($subscription);

			return $this->subscriptions->create(
				$subscription
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param int $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update($id) {
		try {
			$subscription = $this->readInput();

			if (!($subscription instanceof ISubscription)) {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			$subscription->setUserId($this->userId);
			$subscription->setId($id);
			$this->validateSubscription($subscription);

			return $this->subscriptions->update(
				$subscription
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy($id) {
		try {
			$subscription = $this->subscriptions->find(
				$id,
				$this->userId
			);

			$this->subscriptions->delete($subscription);

			return new JSONResponse([
				'message' => 'Subscription was deleted successfully',
			]);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * validate a subscription
	 *
	 * @param ISubscription $subscription
	 * @throws \OCA\Calendar\Http\ReaderException
	 */
	private function validateSubscription(ISubscription $subscription) {
		$backend = $this->backends->bySubscriptionType(
			$subscription->getType()
		);

		if ($backend === null) {
			throw new ReaderException(
				'Subscription-type not supported'
			);
		}

		try {
			$backend->getBackendAPI()->validateSubscription($subscription);
		} catch(BackendException $ex) {
			throw new ReaderException($ex->getMessage());
		}
	}
}
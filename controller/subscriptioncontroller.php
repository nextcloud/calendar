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

use OCA\Calendar\Backend\Exception as BackendException;
use OCA\Calendar\BusinessLayer\Subscription;
use OCA\Calendar\Db\SubscriptionFactory;
use OCA\Calendar\Http\JSON;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ISubscription;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IUserSession;

class SubscriptionController extends Controller {

	/**
	 * BusinessLayer for managing backends
	 * @var Subscription
	 */
	protected $subscriptions;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param Subscription $subscriptions
	 * @param SubscriptionFactory $subscriptionFactory
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								Subscription $subscriptions, SubscriptionFactory $subscriptionFactory) {
		parent::__construct($appName, $request, $userSession);
		$this->subscriptions = $subscriptions;

		$this->registerReader('json', function(IRequest $request) use ($subscriptionFactory) {
			$reader = new JSON\SubscriptionReader($request, $subscriptionFactory);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) {
			return new JSON\SubscriptionResponse($value, $this->getSuccessfulStatusCode());
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
				$this->user->getUID(),
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
				$this->user->getUID()
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

			$subscription->setUserId($this->user->getUID());

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

			$subscription->setUserId($this->user->getUID());
			$subscription->setId($id);

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
				$this->user->getUID()
			);

			$this->subscriptions->delete($subscription);

			return new JSONResponse([
				'message' => 'Subscription was deleted successfully',
			]);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}
}
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

use OCP\AppFramework\IAppContainer;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Calendar\BackendException;
use OCP\Calendar\IBackendCollection;
use OCP\IRequest;
use OCP\Calendar\ISubscription;
use OCP\Calendar\ISubscriptionCollection;

use OCA\Calendar\Http\JSON\JSONSubscriptionReader;
use OCA\Calendar\Http\JSON\JSONSubscriptionResponse;
use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer;
use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\SerializerException;

class SubscriptionController extends Controller {

	/**
	 * backends
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * subscription businesslayer
	 * @var SubscriptionBusinessLayer
	 */
	protected $subscriptions;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param SubscriptionBusinessLayer $subscriptions
	 * @param IBackendCollection $backends
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								SubscriptionBusinessLayer $subscriptions,
								IBackendCollection $backends) {
		parent::__construct($app, $request);
		$this->subscriptions = $subscriptions;
		$this->backends = $backends;

		$this->registerReader('json', function($handle) use ($app) {
			$reader = new JSONSubscriptionReader($app, $handle);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) use ($app) {
			return new JSONSubscriptionResponse($app, $value);
		});
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			$userId = $this->api->getUserId();

			return $this->subscriptions->findAll(
				$userId,
				$limit,
				$offset
			);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @param int $subscriptionId
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show($subscriptionId) {
		try {
			$userId = $this->api->getUserId();

			return $this->subscriptions->find(
				$subscriptionId,
				$userId
			);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create() {
		try {
			$subscription = $this->readInput();
			$userId = $this->api->getUserId();

			if ($subscription instanceof ISubscription) {
				$subscription->setUserId($userId);

				$backend = $this->backends->bySubscriptionType(
					$subscription->getType()
				);

				if ($backend === null) {
					throw new ReaderException(
						'Subscription-type not supported'
					);
				}

				try {
					$backend->getAPI()->validateSubscription($subscription);
				} catch(BackendException $ex) {
					throw new ReaderException($ex->getMessage());
				}

				return $this->subscriptions->create(
					$subscription
				);
			} elseif ($subscription instanceof ISubscriptionCollection) {
				throw new ReaderException(
					'Creating subscription-collections not supported'
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch(ReaderException $ex) {
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_UNPROCESSABLE_ENTITY
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @param int $subscriptionId
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update($subscriptionId) {
		try {
			$subscription = $this->readInput();
			$userId = $this->api->getUserId();

			if ($subscription instanceof ISubscription) {
				$subscription->setUserId($userId);
				$subscription->setId($subscriptionId);

				$backend = $this->backends->bySubscriptionType(
					$subscription->getType()
				);

				if ($backend === null) {
					throw new ReaderException(
						'Subscription-type not supported'
					);
				}

				try {
					$backend->getAPI()->validateSubscription($subscription);
				} catch(BackendException $ex) {
					throw new ReaderException($ex->getMessage());
				}

				return $this->subscriptions->update(
					$subscription
				);
			} elseif ($subscription instanceof ISubscriptionCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource',
					Http::STATUS_BAD_REQUEST
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}
		} catch(BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch(ReaderException $ex) {
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_UNPROCESSABLE_ENTITY
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @param int $subscriptionId
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy($subscriptionId) {
		try {
			$userId	= $this->api->getUserId();

			$subscription = $this->subscriptions->find(
				$subscriptionId,
				$userId
			);

			$this->subscriptions->delete($subscription);

			return new JSONResponse(array(
				'message' => 'Subscription was deleted successfully',
			));
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}
}
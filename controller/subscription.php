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
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer;
use OCA\Calendar\Db\Subscription;
use OCA\Calendar\Db\SubscriptionCollection;
use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\Reader;
use OCA\Calendar\Http\Serializer;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\SerializerException;

class SubscriptionController extends Controller {

	/**
	 * business-layer
	 * @var SubscriptionBusinessLayer
	 */
	protected $businesslayer;


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();

			$nolimit = $this->params('nolimit', false);
			if ($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allSubscriptions = $this->businesslayer->findAll(
				$userId,
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::SubscriptionCollection,
				$allSubscriptions,
				$this->accept()
			);

			return new Response($serializer);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show() {
		try {
			$userId = $this->api->getUserId();
			$id = $this->request->getParam('subscriptionId');

			$subscription = $this->businesslayer->find(
				$id,
				$userId
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::Subscription,
				$subscription,
				$this->accept()
			);

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
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
			$userId = $this->api->getUserId();
			$data = fopen('php://input', 'rb');

			$reader = new Reader(
				$this->app,
				Reader::Subscription,
				$data, 
				$this->contentType()
			);

			$subscription = $reader->sanitize()->getObject();

			if ($subscription instanceof Subscription) {
				$subscription->setUserId($userId);

				$subscription = $this->businesslayer->create($subscription);

				$serializer = new Serializer(
					$this->app,
					Serializer::Subscription,
					$subscription,
					$this->accept()
				);
			} elseif ($subscription instanceof SubscriptionCollection) {
				//TODO implement
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format.'
				);
			}

			return new Response($serializer, Http::STATUS_CREATED);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch(ReaderException $ex) {
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_UNPROCESSABLE_ENTITY
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update() {
		try {
			$userId = $this->api->getUserId();
			$name = $this->request->getParam('subscriptionId');
			$data = fopen('php://input', 'rb');

			$reader = new Reader(
				$this->app,
				Reader::Subscription,
				$data,
				$this->contentType()
			);

			$subscription = $reader->sanitize()->getObject();

			if ($subscription instanceof Subscription) {
				$subscription->setUserId($userId);

				$subscription = $this->businesslayer->update($subscription, $name, $userId);

				$serializer = new Serializer(
					$this->app,
					Serializer::Subscription,
					$subscription,
					$this->accept()
				);
			} elseif ($subscription instanceof SubscriptionCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource.',
					Http::STATUS_BAD_REQUEST
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format.'
				);
			}

			return new Response($serializer);
		} catch(BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch(ReaderException $ex) {
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_UNPROCESSABLE_ENTITY
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy() {
		try {
			$userId	= $this->api->getUserId();
			$name = $this->request->getParam('subscriptionId');

			try {
				$subscription = $this->businesslayer->find(
					$name,
					$userId
				);

			} catch(DoesNotExistException $ex) {
				return new Response(null, Http::STATUS_NOT_FOUND);
			} catch(MultipleObjectsReturnedException $ex) {
				return new Response(null, Http::STATUS_INTERNAL_SERVER_ERROR);
			}

			$this->businesslayer->delete($subscription);

			return new Response();
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}
}
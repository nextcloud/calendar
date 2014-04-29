<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\Http;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\BusinessLayer\BusinessLayerException;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Http\Response;
use \OCA\Calendar\Http\Reader;
use \OCA\Calendar\Http\ReaderException;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\SerializerException;

use \DateTime;

class ObjectController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$nolimit = $this->params('nolimit', false);
			if ($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$calendar = $this->cbl->find(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$objectCollection = $this->obl->findAll(
				$calendar,
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::ObjectCollection,
				$objectCollection,
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
	public function indexInPeriod() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$nolimit = $this->params('nolimit', false);
			if ($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$start = $this->params('start', new DateTime(date('Y-m-01')));
			$end = $this->params('end', new DateTime(date('Y-m-t')));

			$calendar = $this->cbl->find(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$objectCollection = $this->obl->findAllInPeriod(
				$calendar,
				$start,
				$end,
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::ObjectCollection,
				$objectCollection,
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
	public function show() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$objectURI = $this->params('objectId');

			$calendar = $this->cbl->find(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->obl->find(
				$calendar,
				$objectURI
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::Object,
				$object,
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
			$calendarId = $this->params('calendarId');
			$data = fopen('php://input', 'rb');

			$calendar = $this->cbl->find(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::CREATE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$reader = new Reader(
				$this->app,
				Reader::Object,
				$data,
				$this->contentType()
			);

			$object = $reader->sanitize()->getObject()/*->setCalendar($calendar)*/;

			if ($object instanceof Object) {
				$object->setCalendar($calendar);
				$object = $this->obl->createFromRequest(
					$object
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::Object,
					$object,
					$this->accept()
				);
			} elseif ($object instanceof ObjectCollection) {
				$object->setProperty('calendar', $calendar);
				$object = $this->obl->createCollectionFromRequest(
					$object
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::ObjectCollection,
					$object,
					$this->accept()
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format.'
				);
			}

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_NO_CONTENT);
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
			$calendarId = $this->params('calendarId');
			$objectURI = $this->getObjectId();
			$etag = $this->header('if-match');
			$data = fopen('php://input', 'rb');

			$calendar = $this->cbl->find($calendarId, $userId);
			if (!$calendar->doesAllow(Permissions::UPDATE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$reader = new Reader(
				$this->app,
				Reader::Object,
				$data, 
				$this->contentType()
			);

			$object = $reader->sanitize()->getObject()->setCalendar($calendar);

			if ($object instanceof Object) {
				$object = $this->obl->updateFromRequest(
					$object,
					$calendar, 
					$objectURI,
					$etag
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::Object,
					$object,
					$this->accept()
				);
			} elseif ($object instanceof ObjectCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource.',
					Http::STATUS_BAD_REQUEST
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format.'
				);
			}

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_NO_CONTENT);
			}

			return new Response($serializer);
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
	public function destroy() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$objectURI = $this->getObjectId();

			$calendar = $this->cbl->find(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::DELETE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->obl->find(
				$calendar,
				$objectURI
			);
			$this->obl->delete(
				$object
			);

			return new Response(null, HTTP::STATUS_NO_CONTENT);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}



	/**
	 * @brief get objectId of request
	 * TODO - find a better solution
	 * @return $string objectId
	 */
	protected function getObjectId() {
		list($app, $controller, $method) = explode('.', $this->params('_route'));
		return $this->params($controller . 'Id');
	}
}
<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\Http\Http;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\BusinessLayer\BusinessLayerException;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Http\Response;

use \OCA\Calendar\Http\Reader;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\ReaderExpcetion;
use \OCA\Calendar\Http\SerializerException;

class ObjectController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$expand = $this->params('expand', false);

			$nolimit = $this->params('nolimit', false);
			if($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if(!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$objectCollection = $this->objectBusinessLayer->findAll($calendar, $expand,
																	$limit, $offset);

			$serializer = new Serializer(Serializer::ObjectCollection, $objectCollection, $this->accept());

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new Response(array('message' => $ex->getMessage()), $ex->getCode());
		} catch (SerializerException $ex) {

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
			if($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$expand = $this->params('expand', false);
			$start = $this->params('start', new DateTime(date('Y-m-01')));
			$end = $this->params('end', new DateTime(date('Y-m-t')));

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if(!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$objectCollection = $this->objectBusinessLayer->findAllInPeriod($calendar, $start, $end,
																			$expand, $limit, $offset);

			$serializer = new Serializer(Serializer::ObjectCollection, $objectCollection, $this->accept());

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new Response(array('message' => $ex->getMessage()), $ex->getCode());
		} catch (SerializerException $ex) {

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

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if(!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->objectBusinessLayer->find($calendar, $objectURI);

			$serializer = new Serializer(Serializer::Object, $object, $this->accept());

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new Response(array('message' => $ex->getMessage()), $ex->getCode());
		} catch (SerializerException $ex) {

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
			$data = $this->request->params;

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if(!$calendar->doesAllow(Permissions::CREATE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$reader = new Reader(Reader::Object, $data, $this->contentType());
			$object = $reader->sanitize()->getObject()->setCalendar($calendar);

			if($object instanceof Object) {
				$object = $this->objectBusinessLayer->createFromRequest($object);
				$serializer = new Serializer(Serializer::$object, $object, $this->accept());
			} elseif($object instanceof ObjectCollection) {
				$object = $this->objectBusinessLayer->createCollectionFromRequest($object);
				$serializer = new serializer(Serializer::ObjectCollection, $object, $this->accept());
			} else {
				throw new ReaderException('Reader returned unrecognised format.');
			}

			if(!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_NO_CONTENT);
			}

			return new Response($serializer, Http::STATUS_CREATED);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new Response(null, HTTP::STATUS_BAD_REQUEST);
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
			$objectURI = $this->params('objectId');
			$etag = $this->header('if-match');

			$data = $this->request->params;

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if(!$calendar->doesAllow(Permissions::UPDATE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$reader = new Reader(Reader::Object, $data, $this->contentType());

			$object = $reader->sanitize()->getObject()->setCalendar($calendar);
			if($object instanceof Object) {
				$object = $this->objectBusinessLayer->updateFromRequest($object, $calendar, $objectURI, $etag);
			} elseif($object instanceof ObjectCollection) {
				throw new ReaderException('Updates can only be applied to a single resource.', Http::STATUS_BAD_REQUEST);
			} else {
				throw new ReaderException('Reader returned unrecognised format.');
			}

			if(!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_NO_CONTENT);
			}

			$serializer = new Serializer(Serializer::Object, $object, $this->accept());

			return new Response($serializer);
		} catch(BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new Response(null, HTTP::STATUS_BAD_REQUEST);
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
			$objectURI = $this->params('objectId');

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if(!$calendar->doesAllow(Permissions::DELETE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->find($calendar, $objectURI);
			$this->objectBusinessLayer->delete($object);

			return new Response(null, HTTP::STATUS_NO_CONTENT);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new Response(null, HTTP::STATUS_BAD_REQUEST);
		}
	}
}
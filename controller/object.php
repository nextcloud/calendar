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
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCP\IRequest;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Db\Permissions;

use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\TextDownloadResponse;
use OCA\Calendar\Http\Reader;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\Serializer;
use OCA\Calendar\Http\SerializerException;

use DateTime;

class ObjectController extends Controller {

	/**
	 * object business layer
	 * @var ObjectBusinessLayer
	 */
	protected $businesslayer;


	/**
	 * object business layer
	 * @var CalendarBusinessLayer
	 */
	protected $calendarbusinesslayer;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								ObjectBusinessLayer $objectBusinessLayer,
								CalendarBusinessLayer $calendarBusinessLayer) {
		parent::__construct($app, $request, $objectBusinessLayer);
		$this->calendarbusinesslayer = $calendarBusinessLayer;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$calendar = $this->calendarbusinesslayer->findById(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$objectCollection = $this->businesslayer->findAll(
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

			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$start = $this->params('start', new DateTime(date('Y-m-01')));
			$end = $this->params('end', new DateTime(date('Y-m-t')));

			$calendar = $this->calendarbusinesslayer->findById(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$objectCollection = $this->businesslayer->findAllInPeriod(
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

			$calendar = $this->calendarbusinesslayer->findById(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->businesslayer->find(
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

			$calendar = $this->calendarbusinesslayer->findById(
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

			$object = $reader->sanitize()->getObject();

			if ($object instanceof Object) {
				$object->setCalendar($calendar);
				$object = $this->businesslayer->createFromRequest(
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
				$object = $this->businesslayer->createCollectionFromRequest(
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

			$calendar = $this->calendarbusinesslayer->findById($calendarId, $userId);
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
				$object = $this->businesslayer->updateFromRequest(
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

			$calendar = $this->calendarbusinesslayer->findById(
				$calendarId,
				$userId
			);
			if (!$calendar->doesAllow(Permissions::DELETE)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->businesslayer->find(
				$calendar,
				$objectURI
			);
			$this->businesslayer->delete(
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
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function export() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$calendar = $this->calendarbusinesslayer->findById($calendarId, $userId);
			if (!$calendar->doesAllow(Permissions::READ)) {
				return new Response(null, HTTP::STATUS_FORBIDDEN);
			}

			//TODO - evaluate if there is a need for jcal export

			$mimeType = 'text/calendar';
			$filename  = $calendar->getPublicUri();
			$filename .= '.ics';

			$objectCollection = $this->businesslayer->findAll($calendar);

			$serializer = new Serializer(
				$this->app,
				Serializer::ObjectCollection,
				$objectCollection,
				$mimeType
			);

			return new TextDownloadResponse($serializer->serialize(), $filename, $mimeType);
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
	public function import() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$data = fopen('php://input', 'rb');

			$calendar = $this->calendarbusinesslayer->findById(
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

			if ($object instanceof IObject) {
				$object->setCalendar($calendar);
				$object = $this->businesslayer->createFromImport(
					$object
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::Object,
					$object,
					$this->accept()
				);
			} elseif ($object instanceof IObjectCollection) {
				$object->setProperty('calendar', $calendar);
				$object = $this->businesslayer->createCollectionFromImport(
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
	 * Get objectId of request
	 * @return string
	 */
	protected function getObjectId() {
		list(, $controller,) = explode('.', $this->params('_route'));
		return $this->params($controller . 'Id');
	}
}
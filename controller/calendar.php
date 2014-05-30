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
use OCP\IRequest;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;

use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\Reader;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\Serializer;
use OCA\Calendar\Http\SerializerException;

class CalendarController extends Controller {

	/**
	 * business-layer
	 * @var CalendarBusinessLayer
	 */
	protected $businesslayer;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								CalendarBusinessLayer $calendarBusinessLayer,
								ObjectBusinessLayer $objectBusinessLayer) {
		parent::__construct($app, $request, $calendarBusinessLayer);
		$this->objectbusinesslayer = $objectBusinessLayer;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();

			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$calendarCollection = $this->businesslayer->findAll(
				$userId,
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::CalendarCollection,
				$calendarCollection,
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
			$calendarId = $this->request->getParam('calendarId');

			$calendar = $this->businesslayer->findById(
				$calendarId,
				$userId
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::Calendar,
				$calendar,
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
			$data = fopen('php://input', 'rb');

			$reader = new Reader(
				$this->app,
				Reader::Calendar,
				$data,
				$this->contentType()
			);

			$calendar = $reader->sanitize()->getObject();

			if ($calendar instanceof Calendar) {
				$calendar = $this->businesslayer->createFromRequest(
					$calendar
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::Calendar,
					$calendar,
					$this->accept()
				);

			} elseif ($calendar instanceof CalendarCollection) {
				$calendar = $this->businesslayer->createCollectionFromRequest(
					$calendar
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::CalendarCollection,
					$calendar,
					$this->accept()
				);

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
			$calendarId = $this->params('calendarId');
			$data = fopen('php://input', 'rb');

			$reader = new Reader(
				$this->app,
				Reader::Calendar,
				$data,
				$this->contentType()
			);

			$calendar = $reader->sanitize()->getObject();

			if ($calendar instanceof Calendar) {
				$calendar = $this->businesslayer->updateFromRequestById(
					$calendar,
					$calendarId,
					$userId
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::Calendar,
					$calendar,
					$this->accept()
				);
			} elseif ($calendar instanceof CalendarCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource.'
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
	public function patch() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$data = fopen('php://input', 'rb');

			$reader = new Reader(
				$this->app,
				Reader::Calendar,
				$data,
				$this->contentType()
			);

			$calendar = $reader->sanitize()->getObject();

			if ($calendar instanceof Calendar) {
				$calendar = $this->businesslayer->patchFromRequestById(
					$calendar,
					$calendarId,
					$userId
				);

				$serializer = new Serializer(
					$this->app,
					Serializer::Calendar,
					$calendar,
					$this->accept()
				);
			} elseif ($calendar instanceof CalendarCollection) {
				throw new ReaderException(
					'Patches can only be applied to a single resource.'
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
			$calendarId	= $this->params('calendarId');

			$calendar = $this->businesslayer->findById(
				$calendarId, 
				$userId
			);
			$this->businesslayer->delete(
				$calendar
			);

			return new Response();
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
	public function forceUpdate() {
		try {
			$userId	= $this->api->getUserId();

			$this->businesslayer->updateCacheForAllFromRemote(
				$userId,
				null,
				null
			);

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
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
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCP\IRequest;
use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\BusinessLayer\ObjectBusinessLayer;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\TextDownloadResponse;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\SerializerException;
use OCA\Calendar\Http\ICS\ICSObjectReader;
use OCA\Calendar\Http\ICS\ICSObjectResponse;
use OCA\Calendar\Http\ICS\ICSObjectDownloadResponse;
use OCA\Calendar\Http\JSON\JSONObjectReader;
use OCA\Calendar\Http\JSON\JSONObjectResponse;
use DateTime;

class ObjectController extends Controller {

	/**
	 * calendar businesslayer
	 * @var CalendarBusinessLayer
	 */
	protected $calendars;


	/**
	 * object businesslayer
	 * @var ObjectBusinessLayer
	 */
	protected $objects;


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
		parent::__construct($app, $request);
		$this->objects = $objectBusinessLayer;
		$this->calendars = $calendarBusinessLayer;

		$this->registerReader('json', function($handle) use ($app) {
			$reader = new JSONObjectReader($app, $handle);
			return $reader->getObject();
		});
		$this->registerReader('json+calendar', function($handle) use ($app) {
			$reader = new JSONObjectReader($app, $handle);
			return $reader->getObject();
		});
		$this->registerReader('text/calendar', function($handle) use ($app) {
			$reader = new ICSObjectReader($app, $handle);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) use ($app) {
			return new JSONObjectResponse($app, $value);
		});
		$this->registerResponder('json+calendar', function($value) use ($app) {
			return new JSONObjectResponse($app, $value);
		});
		$this->registerResponder('text/calendar', function($value) use ($app) {
			return new ICSObjectResponse($app, $value);
		});
	}


	/**
	 * @param int $calendarId
	 * @param int $limit
	 * @param int $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($calendarId, $limit=null, $offset=null) {
		try {
			$userId = $this->api->getUserId();

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			return $this->objects->findAll(
				$calendar,
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
	 * @param int $calendarId
	 * @param int $limit
	 * @param int $offset
	 * @param string $start
	 * @param string $end
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function indexInPeriod($calendarId, $limit=null,
								  $offset=null, $start, $end) {
		try {
			$userId = $this->api->getUserId();
			/**	@var \DateTime $start */
			$this->parseDateTime($start, new DateTime(date('Y-m-01')));
			/** @var \DateTime $end */
			$this->parseDateTime($end, new DateTime(date('Y-m-t')));

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			return $this->objects->findAllInPeriod(
				$calendar,
				$start,
				$end,
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
	 * @param int $calendarId
	 * @param string $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function show($calendarId, $id) {
		try {
			$userId = $this->api->getUserId();

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			return $this->objects->find(
				$calendar,
				$id
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
	 * @param int $calendarId
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create($calendarId) {
		try {
			$object = $this->readInput();
			$userId = $this->api->getUserId();

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::CREATE)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to create objects in calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			if ($object instanceof IObject) {
				$object->setCalendar($calendar);
				$object = $this->objects->createFromRequest(
					$object
				);
			} elseif ($object instanceof IObjectCollection) {
				throw new ReaderException(
					'Creating object-collections not supported'
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
			}

			return $object;
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
	 * @param int $calendarId
	 * @param string $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update($calendarId, $id) {
		try {
			$object = $this->readInput();

			$userId = $this->api->getUserId();
			$etag = $this->request->getHeader('IF-MATCH');

			$calendar = $this->calendars->findById($calendarId, $userId);

			if (!$calendar->doesAllow(Permissions::UPDATE)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to update objects in calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			if ($object instanceof IObject) {
				$object = $this->objects->updateFromRequest(
					$object,
					$calendar,
					$id,
					$etag
				);
			} elseif ($object instanceof IObjectCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource',
					Http::STATUS_BAD_REQUEST
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
			}

			return $object;
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
	 * @param int $calendarId
	 * @param string $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy($calendarId, $id) {
		try {
			$userId = $this->api->getUserId();

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::DELETE)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to delete objects in calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			$object = $this->objects->find(
				$calendar,
				$id
			);

			$this->objects->delete(
				$object
			);

			return new JSONResponse(array(
				'message' => 'Object was deleted successfully',
			));
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}


	/**
	 * @param int $calendarId
	 * @return TextDownloadResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function export($calendarId) {
		try {
			$userId = $this->api->getUserId();

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			$mimeType = 'application/octet-stream';

			$filename  = $calendar->getPublicUri();
			$filename .= '.ics';

			$objects = $this->objects->findAll($calendar);

			return new ICSObjectDownloadResponse($this->app, $objects,
												 $mimeType, $filename);
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
	 * @param int $calendarId
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function import($calendarId) {
		try {
			$object = $this->readInput();
			$userId = $this->api->getUserId();

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::CREATE)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to create objects in calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			if ($object instanceof IObject) {
				$object->setCalendar($calendar);
				$object = $this->objects->createFromImport(
					$object
				);
			} elseif ($object instanceof IObjectCollection) {
				$object->setProperty('calendar', $calendar);
				$object = $this->objects->createCollectionFromImport(
					$object
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
			}

			return $object;
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
	 * Get objectId of request
	 * @return string
	 */
	protected function getObjectId() {
		$route = $this->request->getParam('_route');
		list(, $controller,) = explode('.', $route);
		return $this->request->getParam($controller . 'Id');
	}
}
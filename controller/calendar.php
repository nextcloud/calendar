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
use OCP\IRequest;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\SerializerException;
use OCA\Calendar\Http\JSON\JSONCalendarReader;
use OCA\Calendar\Http\JSON\JSONCalendarResponse;

class CalendarController extends Controller {

	/**
	 * Calendar-Businesslayer object
	 * @var \OCA\Calendar\BusinessLayer\CalendarBusinessLayer
	 */
	protected $calendars;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param CalendarBusinessLayer $calendars
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								CalendarBusinessLayer $calendars) {
		parent::__construct($app, $request);
		$this->calendars = $calendars;

		$this->registerReader('json', function($handle) use ($app) {
			$reader = new JSONCalendarReader($app, $handle);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) use ($app) {
			return new JSONCalendarResponse($app, $value);
		});
	}


	/**
	 * @param $limit
	 * @param $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			$userId = $this->api->getUserId();

			return $this->calendars->findAll(
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
	 * @param int $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show($id) {
		try {
			$userId = $this->api->getUserId();

			return $this->findByIdAndUserId($id, $userId);
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
			$calendar = $this->readInput();

			if ($calendar instanceof ICalendar) {
				return $this->calendars->createFromRequest(
					$calendar
				);
			} elseif ($calendar instanceof ICalendarCollection) {
				throw new ReaderException(
					'Creating calendar-collections not supported'
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
	 * @param int $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update($id) {
		try {
			$calendar = $this->readInput();
			$userId = $this->api->getUserId();

			if ($calendar instanceof ICalendar) {
				$oldCalendar = $this->findByIdAndUserId($id, $userId);

				return $this->calendars->updateFromRequest(
					$calendar,
					$oldCalendar
				);
			} elseif ($calendar instanceof ICalendarCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource'
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
	 * @param int $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function patch($id) {
		try {
			$calendar = $this->readInput();
			$userId = $this->api->getUserId();

			if ($calendar instanceof ICalendar) {
				$oldCalendar = $this->findByIdAndUserId($id, $userId);

				return $this->calendars->patchFromRequest(
					$calendar,
					$oldCalendar
				);
			} elseif ($calendar instanceof ICalendarCollection) {
				throw new ReaderException(
					'Patches can only be applied to a single resource'
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
	 * @param int $id
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy($id) {
		try {
			$userId	= $this->api->getUserId();

			$calendar = $this->findByIdAndUserId($id, $userId);

			$this->calendars->delete(
				$calendar
			);

			return new JSONResponse(array(
				'message' => 'Calendar was deleted successfully',
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
	 * @param integer $id
	 * @param $userId
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function findByIdAndUserId($id, $userId) {
		$calendar = $this->calendars->findById(
			$id
		);

		if ($calendar->getUserId() !== $userId) {
			throw new BusinessLayerException(
				'Forbidden: Not allowed to access calendar!',
				HTTP::STATUS_FORBIDDEN
			);
		}

		return $calendar;
	}
}
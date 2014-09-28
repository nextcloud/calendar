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
use OCP\Calendar\IBackendCollection;
use OCP\IRequest;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\JSON\JSONCalendarReader;
use OCA\Calendar\Http\JSON\JSONCalendarResponse;

class CalendarController extends Controller {

	/**
	 * Calendar-Businesslayer object
	 * @var \OCA\Calendar\BusinessLayer\CalendarRequestBusinessLayer
	 */
	protected $calendars;


	/**
	 * @var \OCP\Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param CalendarBusinessLayer $calendars
	 * @param IBackendCollection $backends
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								CalendarBusinessLayer $calendars,
								IBackendCollection $backends) {
		parent::__construct($app, $request);
		$this->calendars = $calendars;
		$this->backends = $backends;

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
		} catch (\Exception $ex) {
			return $this->handleException($ex);
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

			return $this->calendars->find($id, $userId);
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
			$calendar = $this->readInput();

			if ($calendar instanceof ICalendar) {
				if ($calendar->getBackend() === null) {
					$backend = $this->backends[0];
					$calendar->setBackend($backend);
				}
				return $this->calendars->create($calendar, $this->api->getUserId());
			} elseif ($calendar instanceof ICalendarCollection) {
				throw new ReaderException(
					'Creating calendar-collections not supported'
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}
		} catch (\Exception $ex) {
			return $this->handleException($ex);
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
				$oldCalendar = $this->calendars->find($id, $userId);

				return $this->calendars->update($calendar, $oldCalendar);
			} elseif ($calendar instanceof ICalendarCollection) {
				throw new ReaderException(
					'Updates can only be applied to a single resource'
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}
		} catch (\Exception $ex) {
			return $this->handleException($ex);
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
				$oldCalendar = $this->calendars->find($id, $userId);

				return $this->calendars->patch($calendar, $oldCalendar);
			} elseif ($calendar instanceof ICalendarCollection) {
				throw new ReaderException(
					'Patches can only be applied to a single resource'
				);
			} else {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}
		} catch (\Exception $ex) {
			return $this->handleException($ex);
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

			$calendar = $this->calendars->find($id, $userId);

			$this->calendars->delete(
				$calendar
			);

			return new JSONResponse(array(
				'message' => 'Calendar was deleted successfully',
			));
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}
}
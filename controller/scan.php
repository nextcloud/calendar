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
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;

use OCA\Calendar\BusinessLayer\BusinessLayerException;

class ScanController extends Controller {

	/**
	 * calendar business-layer
	 * @var CalendarCacheBusinessLayer
	 */
	protected $calendars;


	/**
	 * object business-layer
	 * @var ObjectCacheBusinessLayer
	 */
	protected $objects;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param CalendarCacheBusinessLayer $calendars
	 * @param ObjectCacheBusinessLayer $objects
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								CalendarCacheBusinessLayer $calendars,
								ObjectCacheBusinessLayer $objects) {
		parent::__construct($app, $request);
		$this->calendars = $calendars;
		$this->objects = $objects;
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateMostOutdatedCalendars($limit=null, $offset=null) {
		try {
			$userId = $this->api->getUserId();

			$this->calendars->updateMostOutdated(
				$userId,
				$limit,
				$offset
			);
			$history = $this->calendars->getHistory();

			return new JSONResponse($history);
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
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateCalendarById($calendarId) {
		try {
			$userId = $this->api->getUserId();

			$this->calendars->updateById(
				$calendarId,
				$userId
			);
			$history = reset($this->calendars->getHistory());

			return new JSONResponse($history);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}


	/**
	 * @param string $publicuri
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateCalendarByPublicUri($publicuri) {
		try {
			$userId = $this->api->getUserId();

			$this->calendars->updateByPublicUri(
				$publicuri,
				$userId
			);
			$history = reset($this->calendars->getHistory());

			return new JSONResponse($history);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}


	/**
	 * @param string $backend
	 * @param string $privateuri
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateCalendarByPrivateUri($backend, $privateuri) {
		try {
			$userId = $this->api->getUserId();

			$this->calendars->updateByPrivateUri(
				$backend,
				$privateuri,
				$userId
			);
			$history = reset($this->calendars->getHistory());

			return new JSONResponse($history);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateCalendarsByBackend($limit, $offset) {
		try {
			$userId = $this->api->getUserId();
			$backend = $this->request->getParam('backend');

			$this->calendars->updateByBackend(
				$backend,
				$userId,
				$limit,
				$offset
			);
			$history = $this->calendars->getHistory();

			return new JSONResponse($history);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateAllCalendars($limit, $offset) {
		try {
			$userId = $this->api->getUserId();

			$this->calendars->updateAll(
				$userId,
				$limit,
				$offset
			);
			$history = $this->calendars->getHistory();

			return new JSONResponse($history);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}
}
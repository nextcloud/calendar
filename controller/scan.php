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
use OCA\Calendar\BusinessLayer\CalendarCacheBusinessLayer;
use OCA\Calendar\BusinessLayer\ObjectCacheBusinessLayer;
use OCA\Calendar\Http\Response;

class ScanController extends Controller {

	/**
	 * business-layer
	 * @var CalendarCacheBusinessLayer
	 */
	protected $calendars;


	/**
	 * business-layer
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
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function updateMostOutdatedCalendars() {
		try {
			$userId = $this->api->getUserId();
			$limit = $this->params('limit', null);
			$offset = $this->params('offset', null);

			$this->calendars->updateMostOutdated($userId, $limit, $offset);
			$history = $this->calendars->getHistory();

			return new Response($history);
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
	public function updateCalendarById() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->request->getParam('calendarId');

			$this->calendars->updateById($calendarId, $userId);
			$history = reset($this->calendars->getHistory());

			return new Response($history);
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
	public function updateCalendarByPublicUri() {
		try {
			$userId = $this->api->getUserId();
			$publicuri = $this->request->getParam('publicuri');

			$this->calendars->updateByPublicUri($publicuri, $userId);
			$history = reset($this->calendars->getHistory());

			return new Response($history);
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
	public function updateCalendarByPrivateUri() {
		try {
			$userId = $this->api->getUserId();
			$backend = $this->request->getParam('backend');
			$privateuri = $this->request->getParam('privateuri');

			$this->calendars->updateByPrivateUri($backend, $privateuri, $userId);
			$history = reset($this->calendars->getHistory());

			return new Response($history);
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
	public function updateCalendarsByBackend() {
		try {
			$userId = $this->api->getUserId();
			$backend = $this->request->getParam('backend');
			$limit = $this->params('limit', null);
			$offset = $this->params('offset', null);

			$this->calendars->updateByBackend($backend, $userId, $limit, $offset);
			$history = $this->calendars->getHistory();

			return new Response($history);
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
	public function updateAllCalendars() {
		try {
			$userId = $this->api->getUserId();
			$limit = $this->params('limit', null);
			$offset = $this->params('offset', null);

			$this->calendars->updateAll($userId, $limit, $offset);
			$history = $this->calendars->getHistory();

			return new Response($history);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		}
	}
}
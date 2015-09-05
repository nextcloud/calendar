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

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Http\JSONResponse;

use \OCA\Calendar\Http\ICS\ICSCalendar;
use \OCA\Calendar\Http\ICS\ICSCalendarCollection;
use \OCA\Calendar\Http\ICS\ICSCalendarReader;

use \OCA\Calendar\Http\JSON\JSONCalendar;
use \OCA\Calendar\Http\JSON\JSONCalendarCollection;
use \OCA\Calendar\Http\JSON\JSONCalendarReader;

class CalendarController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();
			$limit = $this->header('X-OC-CAL-LIMIT', 'integer');
			$offset	= $this->header('X-OC-CAL-OFFSET', 'integer');

			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			$calendarCollection = $this->calendarBusinessLayer->findAll($userId, $limit, $offset);
			if($doesAcceptRawICS === true) {
				$serializer = new ICSCalendarCollection($calendarCollection);
			} else {
				$serializer = new JSONCalendarCollection($calendarCollection);
			}

			return new JSONResponse($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	 public function show() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			$calendar = $this->calendarBusinessLayer->find($calendarId, $userId);
			if($doesAcceptRawICS === true) {
				$serializer = new ICSCalendar($calendar);
			} else {
				$serializer = new JSONCalendar($calendar);
			}

			return new JSONResponse($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	public function create() {
		try {
			$userId = $this->api->getUserId();
			$data = $this->request->params;

			$didSendRawICS = $this->didClientSendRawICS();
			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			if($didSendRawICS === true) {
				$reader = new ICSCalendarReader($data);
			} else {
				$reader = new JSONCalendarReader($data);
			}

			var_dump($reader->sanitize()->getObject());
			exit;

			$calendar = $reader->sanitize()->getCalendar();
			$calendar->setUser($userId)->setOwner($userId);

			$calendar = $this->calendarBusinessLayer->create($calendar);

			if($doesAcceptRawICS === true) {
				$serializer = new ICSCalendar($calendar);
			} else {
				$serializer = new JSONCalendar($calendar);
			}

			return new JSONResponse($serializer, HTTP::STATUS_CREATED);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	public function update() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$data = $this->request->params;

			$didSendRawICS = $this->didClientSendRawICS();
			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			//check if calendar exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}

			if($didSendRawICS === true) {
				$reader = new ICSCalendarReader($data);
			} else {
				$reader = new JSONCalendarReader($data);
			}

			$calendar = $reader->sanitize()->getCalendar();
			$calendar->setUser($userId);

			$calendar = $this->calendarBusinessLayer->update($calendar, $calendarId, $userId);

			if($doesAcceptRawICS === true) {
				$serializer = new ICSCalendar($calendar);
			} else {
				$serializer = new JSONCalendar($calendar);
			}

			return new JSONResponse($serializer);
		} catch(BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/** 
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	public function destroy() {
		try {
			$userId	= $this->api->getUserId();
			$calendarId	= $this->params('calendarId');

			//check if calendar exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}

			$this->calendarBusinessLayer->delete($calendarId, $userId);

			return new JSONResponse();
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	public function forceUpdate() {
		try {
			$userId	= $this->api->getUserId();
			$this->calendarBusinessLayer->updateCacheForAllFromRemote($userId);
			return new JSONResponse();
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}
}
<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCA\Calendar\BusinessLayer\BackendBusinessLayer;
use \OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use \OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

use \OCA\Calendar\BusinessLayer\BusinessLayerException;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\JSONCalendar; 
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\JSONObject;

class ViewController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @brief renders the index page
	 * @return an instance of a Response implementation
	 */
	public function index(){
		var_dump('index_called');
		exit;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @brief renders \DateTimeZone::listAbbreviations(); as JSON
	 * @return an instance of a JSONResponse implementation
	 */
	public function timezoneIndex() {
		$timezones = \DateTimeZone::listAbbreviations();
		return new JSONResponse($timezones);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @brief saves the new view
	 * @return an instance of a JSONResponse implementation
	 */
	public function setView(){
		$newView = $this->param('view');
		switch($newView) {
			case 'agendaDay';
			case 'agendaWeek';
			case 'basic2Weeks':
			case 'basic4Weeks':
			case 'list':
				\OCP\Config::setUserValue($this->app->getUserId(), 'calendar', 'currentview', $newView);
				return new JSONResponse(array('newView' => $newView));
				break;
			default:
				return new JSONRespose(array('message'=>'Invalid view'), HTTP::STATUS_BAD_REQUEST);
				break;
		}
	}
}
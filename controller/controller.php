<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\IAppContainer;
use \OCP\IRequest;

use \OCA\Calendar\BusinessLayer\BusinessLayer;
use \OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use \OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

abstract class Controller extends \OCP\AppFramework\Controller {

	/**
	 * calendar business layer
	 * @var \OCA\Calendar\BusinessLayer\CalendarBusinessLayer
	 */
	protected $calendarBusinessLayer;

	/**
	 * object business layer
	 * @var \OCA\Calendar\BusinessLayer\ObjectBusinessLayer
	 */
	protected $objectBusinessLayer;

	/**
	 * core api
	 * @var \OCP\AppFramework\IApi
	 */
	protected $api;

	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								$calendarBusinessLayer=null, $objectBusinessLayer=null){

		parent::__construct($app, $request);

		$this->api = $app->getCoreApi();

		if($calendarBusinessLayer instanceof CalendarBusinessLayer) {
			$this->calendarBusinessLayer = $calendarBusinessLayer;
		}
		if($objectBusinessLayer instanceof ObjectBusinessLayer) {
			$this->objectBusinessLayer = $objectBusinessLayer;		
		}
	}

	/*
	 * Lets you access http request header
	 * @param string $key the key which you want to access in the http request header
	 * @param mixed $default If the key is not found, this value will be returned
	 * @return mixed content of header field
	 */
	protected function header($key, $type='string', $default=null){
		$key = 'HTTP_' . strtoupper($key);

		if(isset($this->request->server[$key]) === false) {
			return $default;
		} else {
			$value = $this->request->server[$key];
			if(strtolower($type) === 'datetime') {
				$value = \DateTime::createFromFormat(\DateTime::ISO8601);
			} else {
				settype($value, $type);
			}
			return $value;
		}
	}

	/**
	 * did user request raw ics instead of json
	 * @param boolean
	 */
	protected function doesClientAcceptRawICS() {
		$accept = $this->header('accept');

		//check if text/calendar is in the text
		//if not, return false
		$textCalendarPosition = stripos($accept, 'text/calendar');
		if($textCalendarPosition === false) {
			return false;
		}

		//get posistion of application/json and application/calendar+json
		$applicationJSONPosition = stripos($accept, 'application/json');
		$applicationCalendarJSONPosition = stripos($accept, 'application/calendar+json');

		if($applicationJSONPosition === false && $applicationCalendarJSONPosition === false) {
			return true;
		}

		$firstApplicationPosition = min($applicationJSONPosition, $applicationCalendarJSONPosition);

		return ($firstApplicationPosition < $textCalendarPosition) ? false : true;
	}

	/**
	 * did user request raw ics instead of json
	 * @param boolean
	 */
	protected function didClientSendRawICS() {
		$contentType = $this->header('content-type'); 

		//check if there is some charset info
		if(stripos($contentType, ';')) {
			$explodeContentType = explode(';', $contentType);
			$contentType = $explodeContentType[0];
		}

		$didClientSendRawICS = false;
		switch($contentType) {
			case 'text/calendar':
				$didClientSendRawICS = true;
				break;

			case 'application/json':
			case 'application/calendar+json':
				$didClientSendRawICS = false;
				break;

			default:
				$didClientSendRawICS = false;
				break;
		}

		return $didClientSendRawICS;
	}
}
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

use \OCP\AppFramework\Http\Http;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\BusinessLayer\BusinessLayerException;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;
use \OCA\Calendar\Db\ObjectType;

use \OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use \OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

use \OCA\Calendar\Http\JSONResponse;

use \OCA\Calendar\Http\ICS\ICSObject;
use \OCA\Calendar\Http\ICS\ICSObjectCollection;
use \OCA\Calendar\Http\ICS\ICSObjectReader;

use \OCA\Calendar\Http\JSON\JSONObject;
use \OCA\Calendar\Http\JSON\JSONObjectCollection;
use \OCA\Calendar\Http\JSON\JSONObjectReader;

abstract class ObjectTypeController extends ObjectController {

	/**
	 * type of object this controller is handling
	 * @var \OCA\Calendar\Db\ObjectType::...
	 */
	protected $objectType;

	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 * @param integer $objectType: type of object, use \OCA\Calendar\Db\ObjectType::...
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								CalendarBusinessLayer $calendarBusinessLayer,
								ObjectBusinessLayer $objectBusinessLayer,
								$type){

		parent::__construct($app, $request,
							$calendarBusinessLayer,
							$objectBusinessLayer);

		$this->objectType = $type;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @CSRFExemption
	 * @API
	 */
	public function index() {
		try {
			var_dump('index called');
			exit;

			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$limit = $this->header('X-OC-CAL-LIMIT', 'integer');
			$offset = $this->header('X-OC-CAL-OFFSET', 'integer');

			$expand = $this->header('X-OC-CAL-EXPAND', 'boolean');
			$start = $this->header('X-OC-CAL-START', 'DateTime');
			$end = $this->header('X-OC-CAL-END', 'DateTime');

			var_dump($doesAcceptRawICS);
			exit;

			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			var_dump($doesAcceptRawICS);
			exit;

			//check if calendar exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}
			//check if user is allowed to read calendar, if not return 403
			if($this->calendarBusinessLayer->doesAllow(Permissions::READ, $calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_FORBIDDEN);
			}

			if($start === null || $end === null) {
				$objectCollection =
				$this->objectBusinessLayer
					->findAllByType($calendarId, $this->objectType,
									$userId, $limit, $offset);
			} else {
				$objectCollection =
				$this->objectBusinessLayer
					->findAllByTypeInPeriod($calendarId, $this->objectType,
											$start, $end,
											$userId, $limit, $offset);
			}

			if($expand === true) {
				$objectCollection->expand($start, $end);
			}

			$serializer = ($doesAcceptRawICS === true) ?
							new ICSObjectCollection($objectCollection) :
							new JSONObjectCollection($objectCollection);

			return new JSONResponse($serializer, Http::STATUS_OK);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, Http::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @CSRFExemption
	 * @API
	 */
	public function show() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$objectId = $this->getObjectId();

			$expand = $this->header('X-OC-CAL-EXPAND', 'boolean');
			$start = $this->header('X-OC-CAL-START', 'DateTime');
			$end = $this->header('X-OC-CAL-END', 'DateTime');

			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			//check if calendar exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}
			//check if user is allowed to read calendar, if not return 403
			if($this->calendarBusinessLayer->doesAllow(Permissions::READ, $calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_FORBIDDEN);
			}

			$object =
			$this->objectBusinessLayer
				->findByType($calendarId, $objectId,
							 $this->objecttype, $userId);

			if($expand === true) {
				$objectCollection = $object->expand($start, $end);
				$serializer = ($doesAcceptRawICS === true) ?
								new ICSObjectCollection($objectCollection) :
								new JSONObjectCollection($objectCollection);
			} else {
				$serializer = ($doesAcceptRawICS === true) ?
								new ICSObject($object) :
								new JSONObject($object);
			}

			return new JSONResponse($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @brief get objectId of request
	 * TODO - find a better solution
	 * @return $string objectId
	 */
	private function getObjectId() {
		list($routeApp, $routeController, $routeMethod) = explode('.', $this->params('_route'));
		return $this->params(substr($routeController, 0, strlen($routeController) - 1) . 'Id');
	}
}
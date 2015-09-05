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

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Http\JSONResponse;

use \OCA\Calendar\Http\ICS\ICSObject;
use \OCA\Calendar\Http\ICS\ICSObjectCollection;
use \OCA\Calendar\Http\ICS\ICSObjectReader;

use \OCA\Calendar\Http\JSON\JSONObject;
use \OCA\Calendar\Http\JSON\JSONObjectCollection;
use \OCA\Calendar\Http\JSON\JSONObjectReader;

class ObjectController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @API
	 */
	public function index() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');

			$limit = $this->header('X-OC-CAL-LIMIT', 'integer');
			$offset = $this->header('X-OC-CAL-OFFSET', 'integer');

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

			if($start === null || $end === null) {
				$objectCollection = 
				$this->objectBusinessLayer
					->findAll($calendarId, $userId,
							  $limit, $offset);
			} else {
				$objectCollection = 
				$this->objectBusinessLayer
					->findAllInPeriod($calendarId, $start,
									  $end, $userId,
									  $limit, $offset);
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
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @CSRFExemption
	 * @API
	 *
	 * @brief returns $object specified by it's UID
	 * @return an instance of a Response implementation 
	 */
	public function show() {
		try {
			$userId	= $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$objectURI = $this->params('objectId');

			$expand = $this->header('X-OC-CAL-EXPAND', 'boolean');
			$start = $this->header('X-OC-CAL-START', 'DateTime');
			$end = $this->header('X-OC-CAL-END', 'DateTime');

			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			//check if calendar and object exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false || 
			   $this->objectBusinessLayer->doesExist($calendarId, $objectURI, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}
			//check if user is allowed to read calendar, if not return 403
			if($this->calendarBusinessLayer->doesAllow(Permissions::READ, $calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_FORBIDDEN);
			}

			$object	= $this->objectBusinessLayer->find($calendarId, $objectURI, $userId);

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
			return new JSONResponse(null, Http::STATUS_NOT_FOUND);
		} catch (JSONException $ex) {
			//do smth
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @CSRFExemption
	 * @API
	 */
	public function create() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$data = $this->request->params;

			//check if calendar exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}
			//check if user is allowed to create objects, if not return 403
			if($this->calendarBusinessLayer->doesAllow(PERMISSIONS::CREATE, $calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_FORBIDDEN);
			}

			$didSendRawICS = $this->didClientSendRawICS();
			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			if($didSendRawICS === true) {
				$reader = new ICSObjectReader($data);
			} else {
				$reader = new JSONObjectReader($data);
			}

			$object = $reader->getObject();
			$type = $object->getType();

			//check if calendar supports type

			$object = $this->objectBusinessLayer->create($object, $calendarid, $userId);

			//return no content if user is not allowed to read
			if($this->calendarBusinessLayer->doesAllow(Permissions::READ, $calendarId, $userId) === false) {
				return new JSONResponse(null, Http::STATUS_NO_CONTENT);
			}

			$serializer = ($doesAcceptRawICS === true) ?
							new ICSObject($object) : 
							new JSONObject($object);

			return new JSONResponse($serializer, Http::STATUS_CREATED);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @CSRFExemption
	 * @API
	 */
	public function update() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$objectURI = $this->params('objectId');
			$data = $this->request->params;

			//check if calendar exists, if not return 404
			if($this->calendarBusinessLayer->doesExist($calendarId, $userId) === false || 
			   $this->objectBusinessLayer->doesExist($calendarId, $objectURI, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_NOT_FOUND);
			}
			//check if user is allowed to update objects, if not return 403
			if($this->calendarBusinessLayer->doesAllow(PERMISSIONS::UPDATE, $calendarId, $userId) === false) {
				return new JSONResponse(null, HTTP::STATUS_FORBIDDEN);
			}

			$didSendRawICS = $this->didClientSendRawICS();
			$doesAcceptRawICS = $this->doesClientAcceptRawICS();

			if($didSendRawICS === true) {
				$reader = new ICSObjectReader($data);
			} else {
				$reader = new JSONObjectReader($data);
			}

			$object = $reader->getObject();

			$object = $this->objectBusinessLayer->update($object, $objectURI, $calendarId, $userId);

			//return no content if user is not allowed to read
			if($this->calendarBusinessLayer->doesAllow(Permissions::READ, $calendarId, $userId) === false) {
				return new JSONResponse(null, Http::STATUS_NO_CONTENT);
			}

			$serializer = ($doesAcceptRawICS === true) ?
							new ICSObject($object) : 
							new JSONObject($object);

			return new JSONResponse($serializer);
		} catch(BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @CSRFExemption
	 * @API
	 */
	public function destroy() {
		try {
			$userId = $this->api->getUserId();
			$calendarId = $this->params('calendarId');
			$objectURI = $this->params('objectId');

			$this->objectBusinessLayer->delete($calendarId, $objectURI, $userId);

			return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'warn');
			return new JSONResponse(null, HTTP::STATUS_BAD_REQUEST);
		}
	}
}
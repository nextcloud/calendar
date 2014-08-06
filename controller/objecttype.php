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
use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\BusinessLayer\ObjectRequestBusinessLayer;
use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\SerializerException;
use DateTime;

abstract class ObjectTypeController extends ObjectController {

	/**
	 * type of object this controller is handling
	 * @var int
	 */
	protected $objectType;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param ObjectRequestBusinessLayer $objectBusinessLayer
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 * @param integer $type
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								ObjectRequestBusinessLayer $objectBusinessLayer,
								CalendarBusinessLayer $calendarBusinessLayer,
								$type){

		parent::__construct($app, $request,
							$objectBusinessLayer,
							$calendarBusinessLayer);

		$this->objectType = $type;
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
			$type = $this->objectType;

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			return $this->objects->findAllByType(
				$calendar,
				$type,
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
			$type = $this->objectType;

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			return $this->objects->findAllByTypeInPeriod(
				$calendar,
				$type,
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
			$type = $this->objectType;

			$calendar = $this->calendars->findById(
				$calendarId,
				$userId
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(array(
					'message' => 'Not allowed to read calendar',
				), HTTP::STATUS_FORBIDDEN);
			}

			return $this->objects->findByType(
				$calendar,
				$id,
				$type
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
}
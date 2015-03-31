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

use OCA\Calendar\BusinessLayer;
use OCA\Calendar\BusinessLayer\CalendarRequestManager;
use OCA\Calendar\BusinessLayer\ObjectRequestManager;
use OCA\Calendar\Db\ObjectCollectionFactory;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Http\ICS;
use OCA\Calendar\Http\JSON;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectCollection;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IUserSession;

use DateTime;

class ObjectController extends Controller {

	/**
	 * BusinessLayer for managing calendars
	 * @var \OCA\Calendar\BusinessLayer\CalendarRequestManager
	 */
	protected $calendars;


	/**
	 * closure for initializing ObjectRequestManager
	 * @var \closure
	 */
	protected $objects;


	/**
	 * type of object this instance of the controller is handling
	 * @var integer
	 */
	protected $objectType;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param CalendarRequestManager $calendars
	 * @param \closure $objects
	 * @param ObjectCollectionFactory $objectFactory
	 * @param integer $type
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								CalendarRequestManager $calendars, \closure $objects,
								ObjectCollectionFactory $objectFactory, $type){
		parent::__construct($appName, $request, $userSession);

		$this->calendars = $calendars;
		$this->objects = $objects;
		$this->objectType = $type;

		$this->registerReader('json', function(IRequest $request) use ($objectFactory) {
			$reader = new JSON\ObjectReader($request, $objectFactory);
			return $reader->getObject();
		});
		$this->registerReader('json+calendar', function(IRequest $request) use ($objectFactory) {
			$reader = new JSON\ObjectReader($request, $objectFactory);
			return $reader->getObject();
		});
		$this->registerReader('text/calendar', function(IRequest $request) use ($objectFactory) {
			$reader = new ICS\ObjectReader($request, $objectFactory);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) {
			return new JSON\ObjectResponse($value, $this->getSuccessfulStatusCode());
		});
		$this->registerResponder('json+calendar', function($value) {
			return new JSON\ObjectResponse($value, $this->getSuccessfulStatusCode());
		});
		$this->registerResponder('text/calendar', function($value) {
			return new ICS\ObjectResponse($value, $this->getSuccessfulStatusCode());
		});
	}


	/**
	 * @param integer $calendarId
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($calendarId, $limit=null, $offset=null) {
		try {
			$calendar = $this->findCalendar($calendarId);
			$this->checkAllowedToRead($calendar);

			return (new ObjectRequestManager($calendar))
				->findAll($this->objectType, $limit, $offset);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @param integer $limit
	 * @param integer $offset
	 * @param string $start
	 * @param string $end
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function indexInPeriod($calendarId, $limit=null,
								  $offset=null, $start, $end) {
		try {
			/**	@var \DateTime $start */
			$this->parseDateTime($start, new DateTime(date('Y-m-01')));
			/** @var \DateTime $end */
			$this->parseDateTime($end, new DateTime(date('Y-m-t')));

			$calendar = $this->findCalendar($calendarId);
			$this->checkAllowedToRead($calendar);

			return (new ObjectRequestManager($calendar))->findAllInPeriod(
				$start, $end, $this->objectType, $limit, $offset);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @param string $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function show($calendarId, $id) {
		try {
			$calendar = $this->findCalendar($calendarId);
			$this->checkAllowedToRead($calendar);

			return (new ObjectRequestManager($calendar))->find(
				$id,
				$this->objectType
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create($calendarId) {
		try {
			$object = $this->readInput();

			$calendar = $this->findCalendar($calendarId);
			if (!$calendar->doesAllow(Permissions::CREATE)) {
				throw new BusinessLayer\Exception(
					'Not allowed to create objects in calendar',
					HTTP::STATUS_FORBIDDEN
				);
			}

			if (!($object instanceof IObject)) {
				return new JSONResponse([
					'message' => 'Reader returned unrecognised format',
				], HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			$object->setCalendar($calendar);
			$object = (new ObjectRequestManager($calendar))->create(
				$object
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
			}

			return $object;
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @param string $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update($calendarId, $id) {
		try {
			$object = $this->readInput();
			$etag = $this->request->getHeader('IF-MATCH');

			$calendar = $this->findCalendar($calendarId);
			if (!$calendar->doesAllow(Permissions::UPDATE)) {
				return new JSONResponse([
					'message' => 'Not allowed to update objects in calendar',
				], HTTP::STATUS_FORBIDDEN);
			}

			if (!($object instanceof IObject)) {
				return new JSONResponse([
					'message' => 'Reader returned unrecognised format',
				], HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			$object->setCalendar($calendar);
			$object->setUri($id);
			$object = (new ObjectRequestManager($calendar))->update(
				$object,
				$etag
			);

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
			}

			return $object;
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @param string $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy($calendarId, $id) {
		try {
			$calendar = $this->findCalendar($calendarId);

			if (!$calendar->doesAllow(Permissions::DELETE)) {
				return new JSONResponse([
					'message' => 'Not allowed to delete objects in calendar',
				], HTTP::STATUS_FORBIDDEN);
			}

			$objectManager = new ObjectRequestManager($calendar);
			$object = $objectManager->find(
				$calendar,
				$id
			);
			$objectManager->delete(
				$object
			);

			return new JSONResponse([
				'message' => 'Object was deleted successfully',
			]);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @return ICS\ObjectDownloadResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function export($calendarId) {
		try {
			$calendar = $this->findCalendar($calendarId);
			$this->checkAllowedToRead($calendar);

			$mimeType = 'application/octet-stream';

			$filename  = $calendar->getPublicUri();
			$filename .= '.ics';

			$objects = (new ObjectRequestManager($calendar))->findAll();

			return new ICS\ObjectDownloadResponse($objects, $mimeType, $filename);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $calendarId
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function import($calendarId) {
		try {
			$object = $this->readInput();

			$calendar = $this->findCalendar($calendarId);
			if (!$calendar->doesAllow(Permissions::CREATE)) {
				return new JSONResponse([
					'message' => 'Not allowed to create objects in calendar',
				], HTTP::STATUS_FORBIDDEN);
			}

			if ($object instanceof IObject) {
				$object->setCalendar($calendar);
				$object = (new ObjectRequestManager($calendar))->create(
					$object
				);
			} elseif ($object instanceof IObjectCollection) {
				$object->setProperty('calendar', $calendar);
				$object = (new ObjectRequestManager($calendar))->createCollection(
					$object
				);
			} else {
				return new JSONResponse([
					'message' => 'Reader returned unrecognised format',
				], HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			if (!$calendar->doesAllow(Permissions::READ)) {
				return new JSONResponse(null, HTTP::STATUS_NO_CONTENT);
			}

			return $object;
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * get calendar entity based on it's id
	 * @param integer $calendarId
	 * @return \OCA\Calendar\ICalendar
	 */
	private function findCalendar($calendarId) {
		return $this->calendars->find(
			$calendarId,
			$this->user->getUID()
		);
	}


	/**
	 * check if the user is allowed to actually read the calendar
	 * @param ICalendar $calendar
	 * @throws BusinessLayer\Exception
	 */
	private function checkAllowedToRead(ICalendar $calendar) {
		if (!$calendar->doesAllow(Permissions::READ)) {
			throw new BusinessLayer\Exception(
				'Not allowed to read calendar',
				HTTP::STATUS_FORBIDDEN
			);
		}
	}
}
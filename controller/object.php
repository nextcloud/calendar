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

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCP\IRequest;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Db\TimezoneMapper;
use OCA\Calendar\Http\ICS\ICSObjectReader;
use OCA\Calendar\Http\ICS\ICSObjectResponse;
use OCA\Calendar\Http\ICS\ICSObjectDownloadResponse;
use OCA\Calendar\Http\JSON\JSONObjectReader;
use OCA\Calendar\Http\JSON\JSONObjectResponse;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\TextDownloadResponse;
use OCA\Calendar\ObjectRequestManager;

use DateTime;

class ObjectController extends Controller {

	/**
	 * BusinessLayer for managing calendars
	 * @var \OCA\Calendar\BusinessLayer\CalendarBusinessLayer
	 */
	protected $calendars;


	/**
	 * type of object this instance of the controller is handling
	 * @var integer
	 */
	protected $objectType;


	/**
	 * BusinessLayer for managing timezones
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 *
	 * TODO - use TimezoneBusinessLayer instead of TimezoneMapper
	 */
	protected $timezones;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param string $userId
	 * @param CalendarBusinessLayer $calendars
	 * @param TimezoneMapper $timezones
	 * @param integer $type
	 */
	public function __construct($appName, IRequest $request, $userId,
								CalendarBusinessLayer $calendars,
								TimezoneMapper $timezones,
								$type){

		parent::__construct($appName, $request, $userId);
		$this->calendars = $calendars;
		$this->objectType = $type;
		$this->timezones = $timezones;

		$this->registerReader('json', function($handle) {
			$reader = new JSONObjectReader($handle);
			return $reader->getObject();
		});
		$this->registerReader('json+calendar', function($handle) {
			$reader = new JSONObjectReader($handle);
			return $reader->getObject();
		});
		$this->registerReader('text/calendar', function($handle) {
			$reader = new ICSObjectReader($handle);
			return $reader->getObject();
		});

		$this->registerResponder('json', function($value) {
			return new JSONObjectResponse($value, $this->timezones);
		});
		$this->registerResponder('json+calendar', function($value) {
			return new JSONObjectResponse($value, $this->timezones);
		});
		$this->registerResponder('text/calendar', function($value) {
			return new ICSObjectResponse($value, $this->timezones);
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
				throw new BusinessLayerException(
					'Not allowed to create objects in calendar',
					HTTP::STATUS_FORBIDDEN
				);
			}

			if (!($object instanceof IObject)) {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
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
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
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
	 * @return TextDownloadResponse
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

			return new ICSObjectDownloadResponse($objects, $this->timezones,
				$mimeType, $filename);
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
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
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
	 * @return \OCP\Calendar\ICalendar
	 */
	private function findCalendar($calendarId) {
		return $this->calendars->find(
			$calendarId,
			$this->userId
		);
	}


	/**
	 * check if the user is allowed to actually read the calendar
	 * @param ICalendar $calendar
	 * @throws BusinessLayerException
	 */
	private function checkAllowedToRead(ICalendar $calendar) {
		if (!$calendar->doesAllow(Permissions::READ)) {
			throw new BusinessLayerException(
				'Not allowed to read calendar',
				HTTP::STATUS_FORBIDDEN
			);
		}
	}
}
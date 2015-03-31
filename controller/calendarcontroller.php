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

use OCA\Calendar\BusinessLayer\CalendarRequestManager;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ICalendar;
use OCP\IRequest;

use OCA\Calendar\Db\TimezoneMapper;
use OCA\Calendar\Http\JSON\JSONCalendarReader;
use OCA\Calendar\Http\JSON\JSONCalendarResponse;
use OCA\Calendar\Http\ReaderException;
use OCP\IUserSession;

class CalendarController extends Controller {

	/**
	 * Collection of initialized backends
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * BusinessLayer for managing calendars
	 * @var CalendarRequestManager
	 */
	protected $calendars;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IBackendCollection $backends
	 * @param TimezoneMapper $timezones
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IBackendCollection $backends,
								TimezoneMapper $timezones) {
		parent::__construct($appName, $request, $userSession);

		$this->calendars = new CalendarRequestManager($backends, $this->userId);
		$this->backends = $backends;

		$this->registerReader('json', function($handle) use ($timezones) {
			return (new JSONCalendarReader($handle,
				$this->userId, $this->backends, $timezones))->getObject();
		});

		$this->registerResponder('json', function($value) {
			return new JSONCalendarResponse($value);
		});
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			return $this->calendars->findAll(
				$this->userId,
				$limit,
				$offset
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show($id) {
		try {
			return $this->calendars->find($id, $this->userId);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create() {
		try {
			$calendar = $this->readInput();

			if (!($calendar instanceof ICalendar)) {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			if ($calendar->getBackend() === null) {
				$backend = $this->backends[0];
				$calendar->setBackend($backend);
			}
			return $this->calendars->create($calendar, $this->userId);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update($id) {
		try {
			$calendar = $this->readInput();

			if (!($calendar instanceof ICalendar)) {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			$oldCalendar = $this->calendars->find($id, $this->userId);
			return $this->calendars->update($calendar, $oldCalendar);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function patch($id) {
		try {
			$calendar = $this->readInput();

			if (!($calendar instanceof ICalendar)) {
				throw new ReaderException(
					'Reader returned unrecognised format'
				);
			}

			$oldCalendar = $this->calendars->find($id, $this->userId);
			return $this->calendars->patch($calendar, $oldCalendar);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param integer $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy($id) {
		try {
			$calendar = $this->calendars->find($id, $this->userId);

			$this->calendars->delete(
				$calendar
			);

			return new JSONResponse([
				'message' => 'CalendarManager was deleted successfully',
			]);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}
}
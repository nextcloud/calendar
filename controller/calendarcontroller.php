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

use OCA\Calendar\BusinessLayer\CalendarManager;
use OCA\Calendar\BusinessLayer\CalendarRequestManager;
use OCA\Calendar\Db\CalendarFactory;
use OCA\Calendar\Http\JSON;
use OCA\Calendar\ICalendar;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IUserSession;

class CalendarController extends Controller {

	/**
	 * BusinessLayer for managing calendars
	 * @var CalendarRequestManager
	 */
	protected $calendars;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param CalendarManager $calendars
	 * @param CalendarFactory $calendarFactory
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								CalendarManager $calendars, CalendarFactory $calendarFactory) {
		parent::__construct($appName, $request, $userSession);
		$this->calendars = $calendars;

		$this->registerReader('json', function(IRequest $request) use ($calendarFactory) {
			return new JSON\CalendarReader($request, $calendarFactory);
		});
		$this->registerResponder('json', function($value) {
			return new JSON\CalendarResponse($value, $this->getSuccessfulStatusCode());
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
				$this->user->getUID(),
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
			return $this->calendars->find($id, $this->user->getUID());
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
				return new JSONResponse([
					'message' => 'Reader returned unrecognised format',
				], HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			return $this->calendars->create($calendar, $this->user->getUID());
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
				return new JSONResponse([
					'message' => 'Reader returned unrecognised format',
				], HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			$oldCalendar = $this->calendars->find($id, $this->user->getUID());
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
				return new JSONResponse([
					'message' => 'Reader returned unrecognised format',
				], HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			$oldCalendar = $this->calendars->find($id, $this->user->getUID());
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
			$calendar = $this->calendars->find($id, $this->user->getUID());

			$this->calendars->delete(
				$calendar
			);

			return new JSONResponse([
				'message' => 'Calendar was deleted successfully',
			]);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}
}
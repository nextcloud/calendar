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
namespace OCA\Calendar\Db;

use OCP\Calendar\IBackend;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IBackendAPI;
use OCP\Calendar\ICalendarAPI;
use OCP\Calendar\IObjectAPI;

class Backend extends Entity implements IBackend {

	/**
	 * @var string
	 */
	public $id;


	/**
	 * @var IBackendAPI
	 */
	public $backendAPI;


	/**
	 * @var ICalendarAPI
	 */
	public $calendarAPI;


	/**
	 * @var \closure
	 */
	protected $objectAPI;


	/**
	 * @var \closure
	 */
	protected $objectCache;


	/**
	 * @param string $id
	 * @return $this
	 */
	public function setId($id) {
		return $this->setter('id', [$id]);
	}


	/**
	 * @return string
	 */
	public function getId() {
		return $this->getter('id');
	}


	/**
	 * @param \closure $backendAPI
	 * @return $this
	 */
	public function setBackendAPI(\closure $backendAPI) {
		$api = call_user_func_array($backendAPI, [$this]);
		if ($api instanceof IBackendAPI) {
			$this->setter('backendAPI', [$api]);
		}

		return $this;
	}


	/**
	 * @return \closure
	 */
	public function getBackendAPI() {
		return $this->getter('backendAPI');
	}


	/**
	 * @param \closure $calendarAPI
	 * @return $this
	 */
	public function setCalendarAPI(\closure $calendarAPI) {
		$api = call_user_func_array($calendarAPI, [$this]);
		if ($api instanceof ICalendarAPI) {
			$this->setter('calendarAPI', [$api]);
		}

		return $this;
	}


	/**
	 * @return \closure
	 */
	public function getCalendarAPI() {
		return $this->getter('calendarAPI');
	}


	/**
	 * @param string $action
	 * @return boolean
	 */
	public function doesCalendarSupport($action) {
		if (!($this->calendarAPI instanceof ICalendarAPI)) {
			return false;
		}

		return is_callable([$this->calendarAPI, $action]);
	}


	/**
	 * @param \closure $objectAPI
	 * @return $this
	 */
	public function setObjectAPI(\closure $objectAPI) {
		return $this->setter('objectAPI', [$objectAPI]);
	}


	/**
	 * @param ICalendar $calendar
	 * @return IObjectAPI
	 */
	public function getObjectAPI(ICalendar $calendar) {
		return call_user_func_array($this->getter('objectAPI'),
			[$calendar]);
	}


	/**
	 * @param \closure $objectAPI
	 * @return $this
	 */
	public function setObjectCache(\closure $objectAPI) {
		return $this->setter('objectCache', [$objectAPI]);
	}


	/**
	 * @param ICalendar $calendar
	 * @return IObjectAPI
	 */
	public function getObjectCache(ICalendar $calendar) {
		return call_user_func_array($this->getter('objectCache'),
			[$calendar]);
	}


	/**
	 * create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->getId();
	}


	/**
	 * register field types
	 */
	protected function registerTypes() {
		$this->addType('id', 'string');
	}


	/**
	 * register mandatory fields
	 */
	protected function registerMandatory() {
		$this->addMandatory('id');
	}
}
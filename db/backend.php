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

use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IBackendAPI;
use OCA\Calendar\ICalendarAPI;
use OCA\Calendar\IObjectAPI;


/**
 * Class Backend
 *
 * @package OCA\Calendar\Db
 *
 * @method static IBackend fromParams(array $data)
 */
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
	 * @var \closure
	 */
	protected $objectScanner;


	/**
	 * @var \closure
	 */
	protected $objectWatcher;


	/**
	 * @var \OCA\Calendar\IBackendCollection
	 */
	protected $collection;


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
	 * @param \closure $objectCache
	 * @return $this
	 */
	public function setObjectCache(\closure $objectCache) {
		return $this->setter('objectCache', [$objectCache]);
	}


	/**
	 * @param ICalendar $calendar
	 * @return \OCA\Calendar\Cache\Object\Cache
	 */
	public function getObjectCache(ICalendar $calendar) {
		return call_user_func_array($this->getter('objectCache'),
			[$calendar]);
	}


	/**
	 * @param \closure $objectScanner
	 * @return $this
	 */
	public function setObjectScanner(\closure $objectScanner) {
		return $this->setter('objectScanner', [$objectScanner]);
	}


	/**
	 * @param ICalendar $calendar
	 * @return \OCA\Calendar\Cache\Object\Scanner
	 */
	public function getObjectScanner(ICalendar $calendar) {
		return call_user_func_array($this->getter('objectScanner'),
			[$calendar]);
	}


	/**
	 * @param \closure $objectWatcher
	 * @return $this
	 */
	public function setObjectWatcher(\closure $objectWatcher) {
		return $this->setter('objectWatcher', [$objectWatcher]);
	}


	/**
	 * @param ICalendar $calendar
	 * @return \OCA\Calendar\Cache\Object\Watcher
	 */
	public function getObjectWatcher(ICalendar $calendar) {
		return call_user_func_array($this->getter('objectWatcher'),
			[$calendar]);
	}


	/**
	 * @param \OCA\Calendar\IBackendCollection $collection
	 */
	public function setBackendCollection(IBackendCollection $collection) {
		$this->collection = $collection;
	}


	/**
	 * @return \OCA\Calendar\IBackendCollection
	 */
	public function getBackendCollection() {
		return $this->collection;
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
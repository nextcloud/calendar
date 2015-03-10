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
namespace OCA\Calendar;

interface IBackend extends IEntity {

	/**
	 * @param string $id
	 * @return $this
	 */
	public function setId($id);


	/**
	 * @return string
	 */
	public function getId();


	/**
	 * @param \closure $backendAPI
	 * @return $this
	 */
	public function setBackendAPI(\closure $backendAPI);


	/**
	 * @return IBackendAPI
	 */
	public function getBackendAPI();


	/**
	 * @param \closure $calendarAPI
	 * @return $this
	 */
	public function setCalendarAPI(\closure $calendarAPI);


	/**
	 * @return ICalendarAPI
	 */
	public function getCalendarAPI();


	/**
	 * @param string $action
	 * @return boolean
	 */
	public function doesCalendarSupport($action);


	/**
	 * @param \closure $objectAPI
	 * @return $this
	 */
	public function setObjectAPI(\closure $objectAPI);


	/**
	 * @param ICalendar $calendar
	 * @return IObjectAPI
	 */
	public function getObjectAPI(ICalendar $calendar);


	/**
	 * @param \closure $objectCache
	 * @return $this
	 */
	public function setObjectCache(\closure $objectCache);


	/**
	 * @param ICalendar $calendar
	 * @return \OCA\Calendar\Cache\Object\Cache
	 */
	public function getObjectCache(ICalendar $calendar);


	/**
	 * @param ICalendar $calendar
	 * @return \OCA\Calendar\Cache\Object\Scanner
	 */
	public function getObjectScanner(ICalendar $calendar);


	/**
	 * @return IBackendCollection
	 */
	public function getBackendCollection();
}
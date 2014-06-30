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
namespace OCP\Calendar;

use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use DateTime;

interface IObject extends IEntity {

	/**
	 * set lastModified to now and update ETag
	 * @return $this
	 */
	public function touch();


	/**
	 * does an object allow
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesAllow($cruds);

	/**
	 * @param ICalendar $calendar
	 * @return $this
	 */
	public function setCalendar(ICalendar $calendar);


	/**
	 * @return ICalendar
	 */
	public function getCalendar();


	/**
	 * @param string $uri
	 * @return $this
	 */
	public function setUri($uri);


	/**
	 * @return string
	 */
	public function getUri();


	/**
	 * @param string $etag
	 * @return $this
	 */
	public function setEtag($etag);


	/**
	 * @param bool $force generate etag if none stored
	 * @return mixed (string|null)
	 */
	public function getEtag($force=false);


	/**
	 * @param integer $ruds
	 * @return $this
	 */
	public function setRuds($ruds);


	/**
	 * @param boolean $force return value all the time
	 * @return mixed (integer|null)
	 */
	public function getRuds($force=false);


	/**
	 * get text/calendar representation of stored object
	 * @return integer
	 */
	public function getCalendarData();

	/**
	 * set the calendarData
	 * @param string $data CalendarData
	 */
	public function setCalendarData($data);


	/**
	 * update Etag
	 * @return $this
	 */
	public function generateEtag();


	/**
	 * @param VCalendar $vobject
	 * @throws CorruptDataException
	 * @return $this
	 */
	public function setVobject(VCalendar $vobject);


	/**
	 * @return VCalendar
	 */
	public function getVobject();


	/**
	 * get type of stored object
	 * @return integer
	 */
	public function getType();


	/**
	 * get startDate
	 * @return \DateTime
	 */
	public function getStartDate();


	/**
	 * get endDate
	 * @return \DateTime
	 */
	public function getEndDate();


	/**
	 * get whether or not object is repeating
	 * @return boolean
	 */
	public function getRepeating();


	/**
	 * get summary of object
	 * @return mixed (string|null)
	 */
	public function getSummary();


	/**
	 * get last modified of object
	 * @return mixed (\DateTime|null)
	 */
	public function getLastModified();


	/**
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return boolean
	 */
	public function isInTimeRange(DateTime $start, DateTime $end);
}
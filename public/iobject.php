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

interface IObject extends IEntity {

	/**
	 * @brief set lastModified to now and update ETag
	 * @return $this
	 */
	public function touch();


	/**
	 * @brief does an object allow
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesAllow($cruds);


	/**
	 * @brief get text/calendar representation of stored object
	 * @return integer
	 */
	public function getCalendarData();

	/**
	 * set the calendarData
	 * @param string $data CalendarData
	 */
	public function setCalendarData($data);


	/**
	 * @brief get etag
	 * @param bool $force
	 * @return string
	 */
	public function getEtag($force=false);


	/**
	 * @brief update Etag
	 * @return $this
	 */
	public function generateEtag();


	/**
	 * @brief get ruds
	 * @param boolean $force return value all the time
	 * @return mixed (integer|null)
	 */
	public function getRuds($force=false);


	/**
	 * @brief set ruds value
	 */
	public function setRuds($ruds);


	/**
	 * @brief get type of stored object
	 * @return integer
	 */
	public function getType();


	/**
	 * @brief get startDate
	 * @return \DateTime
	 */
	public function getStartDate();


	/**
	 * @brief get endDate
	 * @return \DateTime
	 */
	public function getEndDate();


	/**
	 * @brief get whether or not object is repeating
	 * @return boolean
	 */
	public function getRepeating();


	/**
	 * @brief get summary of object
	 * @return mixed (string|null)
	 */
	public function getSummary();


	/**
	 * @brief get last modified of object
	 * @return mixed (\DateTime|null)
	 */
	public function getLastModified();
}
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

interface ICalendar extends IEntity {

	/**
	 * @param string $backend
	 * @return $this
	 */
	public function setBackend($backend);


	/**
	 * @return string
	 */
	public function getBackend();


	/**
	 * @param string $color
	 * @return $this
	 */
	public function setColor($color);


	/**
	 * @return string
	 */
	public function getColor();


	/**
	 * @param int $cruds
	 * @return $this
	 */
	public function setCruds($cruds);


	/**
	 * @return int
	 */
	public function getCruds();


	/**
	 * @param int $components
	 * @return $this
	 */
	public function setComponents($components);


	/**
	 * @return int
	 */
	public function getComponents();


	/**
	 * @param int $ctag
	 * @return $this
	 */
	public function setCtag($ctag);


	/**
	 * @return int
	 */
	public function getCtag();


	/**
	 * @param string $description
	 * @return $this
	 */
	public function setDescription($description);


	/**
	 * @return string
	 */
	public function getDescription();


	/**
	 * @param string $displayname
	 * @return $this
	 */
	public function setDisplayname($displayname);


	/**
	 * @return string
	 */
	public function getDisplayname();


	/**
	 * @param boolean $enabled
	 */
	public function setEnabled($enabled);


	/**
	 * @return boolean
	 */
	public function getEnabled();


	/**
	 * @param int $order
	 * @return $this
	 */
	public function setOrder($order);


	/**
	 * @return int
	 */
	public function getOrder();


	/**
	 * @param string $ownerId
	 * @return $this
	 */
	public function setOwnerId($ownerId);


	/**
	 * @return string
	 */
	public function getOwnerId();


	/**
	 * @param ITimezone $timezone
	 * @return $this
	 */
	public function setTimezone(ITimezone $timezone);


	/**
	 * @return ITimezone
	 */
	public function getTimezone();


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
	 * @param string $userId
	 * @return $this
	 */
	public function setUserId($userId);


	/**
	 * @return string
	 */
	public function getUserId();


	/**
	 * @brief does a calendar allow
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesAllow($cruds);


	/**
	 * @brief does a calendar allow a certain component
	 * @param integer $components
	 * @return boolean
	 */
	public function doesSupport($components);


	/**
	 * @brief increment ctag
	 * @return $this
	 */
	public function touch();
}
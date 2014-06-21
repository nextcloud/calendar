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

interface IBackend extends IEntity {

	/**
	 * registers an API for a backend
	 * @param \OCP\Calendar\IBackendAPI $api
	 * @return $this
	 */
	public function registerAPI(IBackendAPI $api);


	/**
	 * @return IBackend
	 */
	public function getAPI();


	/**
	 * @param boolean $enabled
	 * @return $this
	 */
	public function setEnabled($enabled);


	/**
	 * disables a backend
	 * @return $this
	 */
	public function disable();


	/**
	 * enables a backend
	 * @return $this
	 */
	public function enable();


	/**
	 * @return boolean
	 */
	public function getEnabled();


	/**
	 * @param string $classname
	 * @return $this
	 */
	public function setClassname($classname);


	/**
	 * @return string
	 */
	public function getClassname();


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
	 * @param array $arguments
	 * @return $this
	 */
	public function setArguments($arguments);


	/**
	 * @return array
	 */
	public function getArguments();
}
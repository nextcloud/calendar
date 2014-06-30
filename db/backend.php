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
use OCP\Calendar\IBackendAPI;

class Backend extends Entity implements IBackend {

	/**
	 * @var integer
	 */
	public $id;


	/**
	 * @var string
	 */
	public $backend;


	/**
	 * @var string
	 */
	public $classname;


	/**
	 * @var array
	 */
	public $arguments;


	/**
	 * @var bool
	 */
	public $enabled;


	/**
	 * @var IBackendAPI
	 */
	public $api;


	/**
	 * init Backend object with data from db row
	 * @param array $from
	 */
	public function __construct($from=null){
		$this->addType('backend', 'string');
		$this->addType('classname', 'string');
		$this->addType('arguments', 'array');
		$this->addType('enabled', 'boolean');
		$this->addType('api', 'OCA\\Calendar\\Backend\\IBackend');

		$this->addMandatory('backend');
		$this->addMandatory('classname');
		$this->addMandatory('enabled');

		if (is_array($from)){
			$this->fromRow($from);
		}
	}


	/**
	 * @param boolean $enabled
	 * @return $this
	 */
	public function setEnabled($enabled) {
		return $this->setter('enabled', array($enabled));
	}


	/**
	 * disables a backend
	 * @return $this
	 */
	public function disable() {
		return $this->setEnabled(false);
	}


	/**
	 * enables a backend
	 * @return $this
	 */
	public function enable() {
		return $this->setEnabled(true);
	}


	/**
	 * @return boolean
	 */
	public function getEnabled() {
		return $this->getter('enabled');
	}


	/**
	 * @param string $classname
	 * @return $this
	 */
	public function setClassname($classname) {
		return $this->setter('classname', array($classname));
	}


	/**
	 * @return string
	 */
	public function getClassname() {
		return $this->getter('classname');
	}


	/**
	 * @param string $backend
	 * @return $this
	 */
	public function setBackend($backend) {
		return $this->setter('backend', array($backend));
	}



	/**
	 * @return string
	 */
	public function getBackend() {
		return $this->getter('backend');
	}


	/**
	 * @param array $arguments
	 * @return $this
	 */
	public function setArguments($arguments) {
		return $this->setter('arguments', array($arguments));
	}


	/**
	 * @return array
	 */
	public function getArguments() {
		return $this->getter('arguments');
	}


	/**
	 * registers an API for a backend
	 * @param IBackendAPI $api
	 * @return $this
	 */
	public function registerAPI(IBackendAPI $api){
		$this->api = $api;
		return $this;
	}


	/**
	 * @return IBackendAPI
	 */
	public function getAPI() {
		return $this->getter('api');
	}


	/**
	 * check if object is valid
	 * @return boolean
	 */
	public function isValid() {
		$isValid = parent::isValid();
		if (!$isValid) {
			return false;
		}

		if (!class_exists($this->getClassname())) {
			return false;
		}

		return true;
	}


	/**
	 * create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->getBackend();
	}
}
<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCA\Calendar\Backend\IBackend as IBackendAPI;

class Backend extends Entity implements \OCP\Calendar\IBackend {

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
	 * @brief init Backend object with data from db row
	 * @param array $fromRow
	 */
	public function __construct($fromRow=null){
		$this->addType('backend', 'string');
		$this->addType('classname', 'string');
		$this->addType('enabled', 'boolean');

		if (is_array($fromRow)){
			$this->fromRow($fromRow);
		}
	}


	/**
	 * @param boolean $enabled
	 * @return $this
	 */
	public function setEnabled($enabled) {
		return $this->setter('enabled', $enabled);
	}


	/**
	 * disables a backend
	 * @return Backend
	 */
	public function disable() {
		return $this->setEnabled(false);
	}


	/**
	 * enables a backend
	 * @return Backend
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
		return $this->setter('classname', $classname);
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
		return $this->setter('backend', $backend);
	}



	/**
	 * @return string
	 */
	public function getBackend() {
		return $this->backend;
	}


	/**
	 * @param array $arguments
	 * @return $this
	 */
	public function setArguments($arguments) {
		return $this->setter('arguments', $arguments);
	}


	/**
	 * @return array
	 */
	public function getArguments() {
		return $this->arguments;
	}


	/**
	 * registers an API for a backend
	 * @param IBackendAPI $api
	 * @return Backend
	 */
	public function registerAPI(IBackendAPI $api){
		$this->api = $api;
		return $this;
	}


	/**
	 * @brief check if object is valid
	 * @return boolean
	 */
	public function isValid() {
		if (!is_string($this->backend)) {
			return false;
		}
		if (trim($this->backend) === '') {
			return false;
		}

		if (!is_string($this->classname)) {
			return false;
		}
		if (!class_exists($this->classname)) {
			return false;
		}

		if (!is_null($this->arguments) && !is_array($this->arguments)) {
			return false;
		}

		if (!is_bool($this->enabled)) {
			return false;
		}

		if (!is_null($this->api) && !($this->api instanceof IBackendAPI)) {
			return false;
		}

		return true;
	}


	/**
	 * @brief create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->backend;
	}
}
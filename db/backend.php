<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCP\Calendar\IBackendAPI;

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
	 * @var IBackend
	 */
	public $api;


	/**
	 * @brief init Backend object with data from db row
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
	 * @return IBackend
	 */
	public function getAPI() {
		return $this->getter('api');
	}


	/**
	 * @brief check if object is valid
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
	 * @brief create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->getBackend();
	}
}
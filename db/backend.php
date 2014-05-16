<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCA\Calendar\Backend\IBackend;

class Backend extends Entity {

	public $id;
	public $backend;
	public $classname;
	public $arguments;
	public $enabled;

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
	 * registers an API for a backend
	 * @param IBackend $api
	 * @return Backend
	 */
	public function registerAPI(IBackend $api){
		$this->api = $api;
		return $this;
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

		if (!is_null($this->api) && !($this->api instanceof IBackend)) {
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
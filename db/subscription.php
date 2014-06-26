<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCP\Calendar\ISubscription;

class Subscription extends Entity implements ISubscription {

	/**
	 * @var string
	 */
	public $type;


	/**
	 * @var string
	 */
	public $url;


	/**
	 * @var string
	 */
	public $userId;


	/**
	 * @brief init Backend object with data from db row
	 * @param array $fromRow
	 */
	public function __construct($fromRow=null){
		$this->addType('type', 'string');
		$this->addType('url', 'string');
		$this->addType('userId', 'string');

		$this->addMandatory('type');
		$this->addMandatory('url');
		$this->addMandatory('userId');

		if (is_array($fromRow)){
			$this->fromRow($fromRow);
		}
	}


	/**
	 * @param string $type
	 * @return $this
	 */
	public function setType($type) {
		return $this->setter('type', array($type));
	}


	/**
	 * @return string
	 */
	public function getType() {
		return $this->getter('type');
	}


	/**
	 * @param string $url
	 * @return $this
	 */
	public function setUrl($url) {
		return $this->setter('url', array($url));
	}


	/**
	 * @return string
	 */
	public function getUrl() {
		return $this->getter('url');
	}


	/**
	 * @param string $userId
	 * @return $this
	 */
	public function setUserId($userId) {
		return $this->setter('userId', array($userId));
	}


	/**
	 * @return string
	 */
	public function getUserId() {
		return $this->getter('userId');
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

		$parsedURL = parse_url($this->getUrl());
		if (!$parsedURL) {
			return false;
		}
		if (!array_key_exists('host', $parsedURL)) {
			return false;
		}

		return true;
	}


	/**
	 * @brief create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->userId . '::' . $this->type . '::' . $this->url;
	}
}
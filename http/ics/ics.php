<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use \OCA\Calendar\Http\IResponse;

abstract class ICS implements IResponse {

	protected $object;

	/**
	 * @brief Constructor
	 */
	public function __construct($object) {
		$this->object = $object;
	}

	/**
	 * @brief get object JSONObject was initialized with.
	 */
	protected function getObject() {
		return $this->object;
	}

	/**
	 * @brief get mimetype of serialized output
	 */
	public function getMimeType() {
		return 'text/calendar';
	}

	/**
	 * @brief get ics-encoded string containing all information
	 */
	abstract public function serialize();
}
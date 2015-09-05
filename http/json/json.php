<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Db\Entity;
use \OCA\Calendar\Http\IResponse;

abstract class JSON implements IResponse {

	protected $object;
	protected $vobject;

	/**
	 * @brief Constructor
	 */
	public function __construct(Entity $object) {
		$this->object = $object;
		try {
			$this->vobject = $object->getVObject();
		} catch(/* some */Exception $ex) {
			
		}
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
		return 'application/calendar+json';
	}

	/**
	 * @brief get json-encoded string containing all information
	 */
	abstract public function serialize();
}

class JSONException extends \Exception {}
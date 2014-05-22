<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use OCP\Calendar\IBackend;

use OCA\Calendar\Http\SerializerException;

class JSONBackendCollection extends JSONCollection {

	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array_merge(
			parent::getHeaders(),
			array(
				'Content-type' => 'application/json; charset=utf-8',
			)
		);
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return array
	 */
	public function serialize() {
		$jsonArray = array();

		$this->object->iterate(function(IBackend &$object) use (&$jsonArray) {
			try {
				$jsonBackend = new JSONBackend($this->app, $object);
				$jsonArray[] = $jsonBackend->serialize();
			} catch (SerializerException $ex) {
				//TODO - log error msg
				return;
			}
		});

		return $jsonArray;
	}
}
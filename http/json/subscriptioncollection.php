<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

class JSONSubscriptionCollection extends JSONCollection {

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

		$this->object->iterate(function(&$object) use (&$jsonArray) {
			try {
				$jsonSubscription = new JSONSubscription($this->app, $object);
				$jsonArray[] = $jsonSubscription->serialize();
			} catch (JSONException $ex) {
				//TODO - log error msg
				return;
			}
		});

		return $jsonArray;
	}
}
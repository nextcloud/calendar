<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

interface ISerializer {

	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders();


	/**
	 * @brief get serialized data
	 * @return string
	 */
	public function serialize();
}
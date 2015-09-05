<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Db\Collection;
use \OCA\Calendar\Http\IResponse;

abstract class JSONCollection extends JSON {

	/**
	 * @brief Constructor
	 */
	public function __construct(Collection $object) {
		$this->object = $object;
	}
}
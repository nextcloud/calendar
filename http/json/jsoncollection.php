<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Collection;

abstract class JSONCollection extends JSON {

	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param Collection $object
	 */
	public function __construct(IAppContainer $app, Collection $object) {
		$this->app = $app;
		$this->object = $object;
	}
}
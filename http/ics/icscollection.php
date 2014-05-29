<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCP\AppFramework\IAppContainer;
use OCP\Calendar\ICollection;

abstract class ICSCollection extends ICS {

	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param ICollection $object
	 */
	public function __construct(IAppContainer $app, ICollection $object) {
		$this->app = $app;
		$this->object = $object;
	}
}
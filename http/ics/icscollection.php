<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use \OCA\Calendar\Db\Collection;
use \OCA\Calendar\Http\IResponse;

abstract class ICSCollection extends ICS {

	/**
	 * @brief set object
	 * @param Collection $object
	 */
	public function setObject($object) {
		if ($object instanceof Collection) {
			$this->object = $object;
			return $this;
		}
		return null;
	}
}
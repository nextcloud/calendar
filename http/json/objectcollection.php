<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

class JSONObjectCollection extends JSONObject {

	public function extend(\DateTime $start, \DateTime $end) {
		$this->vobject->extend($start, $end);
	}
}
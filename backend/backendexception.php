<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Backend;

class BackendException extends \Exception {
	const OTHER = -1;
	const CACHEOUTDATED = 1;
	const DOESNOTIMPLEMENT = 2;
}
<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

class Permissions {
	const CREATE	= 4;
	const READ		= 1;
	const UPDATE	= 2;
	const DELETE	= 8;
	const SHARE		= 16;
	const ALL		= 31;

	const ALL_CALENDAR = 31;
	const ALL_OBJECT = 27;
}
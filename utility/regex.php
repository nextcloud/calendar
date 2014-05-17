<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

class RegexUtility {

	/**
	 * regex for slugified uri
	 * @var string
	 */
	const URI = '/[A-Za-z0-9]+/';


	/**
	 * regex for rgb(a)
	 * @var string
	 */
	const RGBA = '/#((?:[0-9a-fA-F]{2}){3}|(?:[0-9a-fA-F]{1}){3}|(?:[0-9a-fA-F]{1}){4}|(?:[0-9a-fA-F]{2}){4})$/';


	/**
	 * regex for VEvent
	 * @var string
	 */
	const VEVENT = '/BEGIN:VEVENT\n([\s\S]*?)\nEND:VEVENT\n/';


	/**
	 * regex for VJournal
	 * @var string
	 */
	const VJOURNAL = '/BEGIN:VJOURNAL\n([\s\S]*?)\nEND:VJOURNAL\n/';


	/**
	 * regex for VTodo
	 * @var string
	 */
	const VTODO = '/BEGIN:VTODO\n([\s\S]*?)\nEND:VTODO\n/';


	/**
	 * regex for VFreeBusy
	 * @var string
	 */
	const VFREEBUSY  = '/BEGIN:VFREEBUSY\n([\s\S]*?)\nEND:VFREEBUSY\n/';


	/**
	 * regex for VTimezone
	 * @var string
	 */
	const VTIMEZONE = '/BEGIN:VTIMEZONE\n([\s\S]*?)\nEND:VTIMEZONE\n/';
}
<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Utility;

class RegexUtility {

	/**
	 * regex for slugified uri
	 * @var string
	 */
	const URI = '/[A-Za-z0-9]+/';


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
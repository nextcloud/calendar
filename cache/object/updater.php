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
namespace OCA\Calendar\Cache\Object;

use OCA\Calendar\ICalendar;

class Updater {

	/**
	 * @var |OCA\Calendar\ICalendar
	 */
	protected $calendar;


	/**
	 * @var \OCA\Calendar\Cache\Object\ChangePropagator
	 */
	protected $propagator;


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->calendar = $calendar;
		$this->propagator = new ChangePropagator($calendar);
	}


	/**
	 * @param string $objectUri
	 */
	public function propagate($objectUri) {
		$this->propagator->addChange($objectUri);
	}


	/**
	 * propagate any leftover changes
	 */
	public function __destruct() {
		$this->propagator->propagateChanges();
	}
}
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

use OCP\Calendar\DoesNotExistException;

use OCA\Calendar\Sabre\VObject\Component;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\VObject\Component\VEvent;
use OCA\Calendar\Sabre\VObject\Component\VJournal;
use OCA\Calendar\Sabre\VObject\Component\VTodo;
use OCA\Calendar\Sabre\VObject\Component\VFreeBusy;
use OCA\Calendar\Sabre\VObject\Parameter;
use OCA\Calendar\Sabre\VObject\Property\ICalendar\DateTime;

use OCA\Calendar\Db\TimezoneMapper;

class SabreUtility extends Utility {

	/**
	 * get property name of first object
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return mixed (string|bool)
	 */
	public static function getObjectName($vcalendar) {
		foreach($vcalendar->children() as $child) {
			if ($child instanceof VEvent ||
			   $child instanceof VJournal ||
			   $child instanceof VTodo ||
			   $child instanceof VFreeBusy) {
				return $child->name;
			}
		}

		return false;
	}


	/**
	 * count number of events, journals, todos
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countObjects(VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, array('VEVENT', 'VJOURNAL', 'VTODO'));
	}


	/**
	 * count number of freebusys
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countFreeBusys(VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, array('VFREEBUSY'));
	}


	/**
	 * count number of timezones
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countTimezones(VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, array('VTIMEZONE'));
	}


	/**
	 * count number of components by identifier definied in $properties
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @param array $properties
	 * @return integer
	 */
	public function countSabreObjects(VCalendar $vcalendar, $properties) {
		$count = 0;

		foreach($properties as $property) {
			if (isset($vcalendar->$property)) {
				if (is_array($vcalendar->$object)) {
					$count += count($vcalendar->$object);
				}
				if ($vcalendar->$object instanceof Component) {
					$count++;
				}
			}
		}

		return $count;
	}


	/**
	 * count number of unique UIDs inside a calendar
	 * @param VCalendar $vcalendar
	 * @return integer
	 */
	public static function countUniqueUIDs(VCalendar $vcalendar) {
		$uids = array();

		foreach($vcalendar->children() as $child) {
			if ($child instanceof VEvent ||
			   $child instanceof VJournal ||
			   $child instanceof VTodo ||
			   $child instanceof VFreeBusy) {
				$uids[] = (string) $child->{'UID'};
			}
		}

		$uniqueUIDs = array_unique($uids);
		$numberOfUniqueUIDs = count($uniqueUIDs);

		return $numberOfUniqueUIDs;
	}


	/**
	 * get DTSTART property of object
	 * @param Component $vobject
	 * @return DateTime $dstart
	 */
	public static function getDTStart(Component $vobject) {
		if (!isset($vobject->{'DTSTART'})) {
			return null;
		}

		//If recurrenceId is set, that's the actual start
		//DTSTART has the value of the first object of recurring events
		//This doesn't make any sense, but that's how it is in the standard
		if (isset($vobject->{'RECURRENCE-ID'})) {
			return $vobject->{'RECURRENCE-ID'};
		}

		return $vobject->{'DTSTART'};
	}


	/**
	 * get DTEND property of object
	 * @param Component $vobject
	 * @return DateTime $dtend
	 */
	public static function getDTEnd(Component $vobject) {
		if (isset($vobject->{'DTEND'})) {
			return $vobject->{'DTEND'};
		}

		if (!isset($vobject->{'DTSTART'})) {
			return null;
		}

		$dtend = self::getDTStart($vobject);

		if (!isset($vobject->{'DURATION'})) {
			return $dtend;
		}

		$interval = $vobject->{'DURATION'}->getDateInterval();

		$dtend->getDateTime()->add($interval);

		return $dtend;
	}


	/**
	 * add missing timezones to an object
	 * @param VCalendar &$vcalendar
	 * @param TimezoneMapper &$tzMapper
	 */
	public static function addMissingVTimezones(VCalendar &$vcalendar, TimezoneMapper &$tzMapper) {
		$tzIds = self::parseComponentForTzIds($vcalendar);
		$tzIds = array_unique($tzIds);

		$tzIdsInVCalendar = array();

		foreach($vcalendar->select('VTIMEZONE') as $vtimezone) {
			$tzIdsInVCalendar[] = (string)$vtimezone->TZID;
		}

		$missingTzIds = array_diff($tzIds, $tzIdsInVCalendar);

		foreach($missingTzIds as $tzId) {
			try {
				$timezonesVCalendar = $tzMapper->find($tzId, null)->getVObject();
				$vcalendar->add($timezonesVCalendar->{'VTIMEZONE'});
			} catch(DoesNotExistException $ex) {
				continue;
			}
		}
	}


	/**
	 * parse a component for tzIds
	 * @param Component &$component
	 * @return array
	 */
	public static function parseComponentForTzIds(Component &$component) {
		$tzIds = array();

		foreach($component->children() as $child) {
			if($child instanceof Component) {
				$tzIds = array_merge(
					$tzIds,
					self::parseComponentForTzIds($child)
				);
			} elseif($child instanceof DateTime) {
				$parameters = $child->parameters();
				if(array_key_exists('TZID', $parameters)) {
					/** @var Parameter $tzParameter */
					$tzParameter = $parameters['TZID'];
					$tzIds[] = $tzParameter->getValue();
				}
			}
		}

		return $tzIds;
	}


	/**
	 * parse a component for X-OC-* properties and removes them
	 * @param Component &$component
	 * @return void
	 */
	public static function removeXOCAttrFromComponent(Component &$component) {
		foreach($component->children() as $child) {
			if($child instanceof Component) {
				self::removeXOCAttrFromComponent($child);
			} elseif(substr($child->name, 0, 5) === 'X-OC-') {
				unset($component->{$child->name});
			}
		}
	}
}
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

use OCP\AppFramework\Db\DoesNotExistException;

use OCA\Calendar\Db\Timezone;
use OCA\Calendar\Db\TimezoneMapper;
use Sabre\VObject\Component;
use Sabre\VObject\Parameter;
use Sabre\VObject\Property\ICalendar\DateTime;

class SabreUtility extends Utility {

	/**
	 * get property name of first object
	 * @param Component\VCalendar $vcalendar
	 * @return string|bool
	 */
	public static function getObjectName(Component\VCalendar $vcalendar) {
		foreach($vcalendar->children() as $child) {
			if ($child instanceof Component\VEvent ||
				$child instanceof Component\VJournal ||
				$child instanceof Component\VTodo ||
				$child instanceof Component\VFreeBusy) {
				return $child->name;
			}
		}

		return false;
	}


	/**
	 * count number of VEvents, VJournals, VTodos
	 * @param Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countObjects(Component\VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, ['VEVENT', 'VJOURNAL', 'VTODO']);
	}


	/**
	 * count number of VFreeBusys
	 * @param Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countFreeBusys(Component\VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, ['VFREEBUSY']);
	}


	/**
	 * count number of VTimezones
	 * @param Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countTimezones(Component\VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, ['VTIMEZONE']);
	}


	/**
	 * count number of components by identifier defined in $properties
	 * @param \Sabre\VObject\Component\VCalendar $vcalendar
	 * @param array $properties array of strings representing $properties
	 * @return integer
	 */
	public function countSabreObjects(Component\VCalendar $vcalendar, $properties) {
		$count = 0;

		foreach($properties as $property) {
			if (isset($vcalendar->{$property})) {
				if (is_array($vcalendar->{$property})) {
					$count += count($vcalendar->{$property});
				}
				if ($vcalendar->{$property} instanceof Component) {
					$count++;
				}
			}
		}

		return $count;
	}


	/**
	 * count number of unique UIDs inside a calendar
	 * @param Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countUniqueUIDs(Component\VCalendar $vcalendar) {
		$uids = [];

		foreach($vcalendar->children() as $child) {
			if ($child instanceof Component\VEvent ||
			   $child instanceof Component\VJournal ||
			   $child instanceof Component\VTodo ||
			   $child instanceof Component\VFreeBusy) {
				$uids[] = $child->{'UID'}->getValue();
			}
		}

		return count(array_unique($uids));
	}


	/**
	 * get DTSTART property of object
	 * @param Component $vobject
	 * @return DateTime
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
	 * @return DateTime
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
	 * add missing timezones from VCalendar
	 * @param Component\VCalendar &$vcalendar
	 * @param TimezoneMapper $tzMapper
	 */
	public static function addMissingVTimezones(Component\VCalendar &$vcalendar, TimezoneMapper $tzMapper) {
		$tzIds = self::parseComponentForTzIds($vcalendar);

		$tzIdsInVCalendar = [];
		foreach($vcalendar->select('VTIMEZONE') as $vtimezone) {
			$tzIdsInVCalendar[] = $vtimezone->{'TZID'}->getValue();
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
		$tzIds = [];

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

		return array_unique($tzIds);
	}


	/**
	 * remove certain X-OC-* properties from a Sabre Component
	 * @param Component &$component
	 */
	public static function removeXOCAttrFromComponent(Component &$component) {
		foreach($component->children() as $child) {
			if($child instanceof Component) {
				self::removeXOCAttrFromComponent($child);
			} elseif(substr($child->name, 0, 5) === 'X-OC-') {
				switch($child->name) {
					case 'X-OC-ETAG':
					case 'X-OC-URI':
						unset($component->{$child->name});
						break;

					default:
						break;
				}
			}
		}
	}


	/**
	 * extract timezone-data for a certain timezone from Component\VCalendar object
	 * @param Component\VCalendar $vcalendar
	 * @param string $timezoneId
	 * @return Timezone|null
	 */
	public static function getTimezoneFromVObject(Component\VCalendar $vcalendar, $timezoneId) {
		foreach($vcalendar->select('VTIMEZONE') as $vtimezone) {
			if($vtimezone->TZID === $timezoneId) {
				return new Timezone($vtimezone);
			}
		}

		return null;
	}
}
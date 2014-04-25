<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

use \DateTimeZone;

use \OCA\Calendar\Sabre\VObject\Component;
use \OCA\Calendar\Sabre\VObject\Component\VCalendar;
use \OCA\Calendar\Sabre\VObject\Component\VEvent;
use \OCA\Calendar\Sabre\VObject\Component\VJournal;
use \OCA\Calendar\Sabre\VObject\Component\VTodo;
use \OCA\Calendar\Sabre\VObject\Component\VFreeBusy;

use \OCA\Calendar\Sabre\VObject\Property\ICalendar\DateTime as DateTimeProperty;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneMapper;

use \OCA\Calendar\Db\DoesNotExistException;

class SabreUtility extends Utility {

	/**
	 * @brief get property name of first object
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return string property name
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
	}


	/**
	 * @brief count number of events, journals, todos
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countObjects(VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, array('VEVENT', 'VJOURNAL', 'VTODO'));
	}


	/**
	 * @brief count number of freebusys
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countFreeBusys(VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, array('VFREEBUSY'));
	}


	/**
	 * @brief count number of timezones
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @return integer
	 */
	public static function countTimezones(VCalendar $vcalendar) {
		return self::countSabreObjects($vcalendar, array('VTIMEZONE'));
	}


	/**
	 * @brief count number of components by identifier definied in $properties
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
	 * @brief count number of unique UIDs inside a calendar
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
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
	 * @brief get dtstart property of object
	 * @param \OCA\Calendar\Sabre\VObject\Component $vobject
	 * @return \OCA\Calendar\Sabre\VObject\Property\DateTime $dstart
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
	 * @brief get dtend property of object
	 * @param \OCA\Calendar\Sabre\VObject\Component $vobject
	 * @return \OCA\Calendar\Sabre\VObject\Property\DateTime $dtend
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
	 * @brief add missing timezones to an object
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
	 * @param \OCA\Calendar\Db\TimezoneMapper $tzMapper
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
				$timezonesVCalendar = $tzMapper->find($tzId)->vobject;
				$vcalendar->add($timezonesVCalendar->{'VTIMEZONE'});
			} catch(DoesNotExistException $ex) {
				continue;
			}
		}
	}


	/**
	 * @brief parse a component 
	 * @param \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar
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
			} elseif($child instanceof DateTimeProperty) {
				$parameters = $child->parameters;
				if(array_key_exists('TZID', $parameters)) {
					$tzIds[] = $parameters['TZID']->getValue();
				}
			}
		}

		return $tzIds;
	}
}
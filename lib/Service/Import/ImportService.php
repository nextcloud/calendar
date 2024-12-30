<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Import;

use Exception;
use OCP\Calendar\CalendarImportSettings;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarImport;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Node;
use Sabre\VObject\Reader;

class ImportService {
	
	public const FORMATS = ['ical', 'jcal', 'xcal'];

	public function __construct() {}

	/**
	 * Retrieves calendar object, converts each object to appropriate format and streams output
	 */
	public function import($stream, ICalendar $calendar, CalendarImportSettings $settings): void {

		$time_start = microtime(true);

		echo "\nMemory usage: " . memory_get_usage()/1048576;
		
		//Reader::read($stream);

		switch ($settings->format) {
			case 'ical':
				$this->importICal($stream, $calendar, $settings);
				break;
			case 'jcal':
				$this->importICal($stream, $calendar, $settings);
				break;
			case 'xcal':
				$this->importICal($stream, $calendar, $settings);
				break;
		}

		$time_end = microtime(true);

		$execution_time = ($time_end - $time_start);

		echo "\nProcessing time: " . $execution_time;
		echo "\n";

	}

	private function importICal($stream, ICalendar $calendar, CalendarImportSettings $settings): void {

		$outcome = [];
		$structure = $this->analyzeICal($stream);

		$vStart = "BEGIN:VCALENDAR" . PHP_EOL;
		$vEnd = PHP_EOL . "END:VCALENDAR";

		// calendar properties
		foreach ($structure['VCALENDAR'] as $entry) {
			$vStart .= $entry;
			if (!substr($entry, -1) === "\n" || !substr($entry, -2) === "\r\n") {
				$vStart .= PHP_EOL;
			}
		}

		// calendar time zones
		$timezones = [];
		foreach ($structure['VTIMEZONE'] as $tid => $collection) {
			$instance = $collection[0];
			$vData = $this->extractICalData($stream, $instance[2], $instance[3]);
			$vObject = Reader::read($vStart . $vData . $vEnd);
			$timezones[$tid] = clone $vObject->VTIMEZONE;
		}

		// calendar components
		$components = [];
		foreach ($structure['VEVENT'] as $cid => $collection) {
			// extract and unserialize components
			$vData = "";
			foreach ($collection as $instance) {
				$vData .= $this->extractICalData($stream, $instance[2], $instance[3]);
			}
			/** @var VCalendar $vObject */
			$vObject = Reader::read($vStart . $vData . $vEnd);
			// extract all timezones from properties for all instances
			$vObjectTZ = [];
			foreach ($vObject->getComponents() as $vComponent) {
				if ($vComponent->name !== 'VTIMEZONE') {
					foreach (['DTSTART', 'DTEND', 'DUE', 'RDATE', 'EXDATE'] as $property) {
						if (isset($vComponent->$property?->parameters['TZID'])) {
							$tid = $vComponent->$property->parameters['TZID']->getValue();
							if (isset($timezones[$tid]) && !isset($vObjectTZ[$tid])) {
								$vObjectTZ[$tid] = clone $timezones[$tid];
							}
						}
					}
				}
			}
			// add time zones to object
			foreach ($vObjectTZ as $zone) {
				$vObject->add($zone);
			}
			// validate object
			if ($settings->validate !== 0) {
				$issues = $this->validateComponent($vObject, true, 3);
			} else {
				$issues = [];
			}
			if ($settings->validate === 1 && $issues !== []) {
				$outcome[$cid] = $issues;
				continue;
			}
			if ($settings->validate === 2 && $issues !== []) {
				throw new Exception('Error importing calendar object <' . $cid . '> ' . $issues[0]);
			}
			// add objects to collection until max batch size is reached
			if ($settings->bulk > count($components)) {
				$components[] = $vObject;
			}
			// save collection to storage if max batch size is reached
			if ($settings->bulk <= count($components)) {
				$calendar->import($settings, ...$components);
				$components = [];
			}
		}

		// save collection to storage if max bulk was not reached
		if (count($components) > 0) {
			$calendar->import($settings, ...$components);
			$components = [];
		}

	}

	private function validateComponent(VCalendar $vObject, bool $repair, int $level): array {
		// validate component(S)
		$issues = $vObject->validate(Node::PROFILE_CALDAV);
		// attempt to repair
		if ($repair && count($issues) > 0) {
			$issues = $vObject->validate(Node::REPAIR);
		}
		// filter out messages based on level
		$result = [];
		foreach ($issues as $key => $issue) {
			if (isset($issue['level']) && $issue['level'] >= $level) {
				$result[] = $issue['message'];
			}
		}

		return $result;
	}

	private function analyzeICal($stream): array {

		$tags = ['VEVENT', 'VTODO', 'VJOURNAL', 'VTIMEZONE'];

		$components = ['VCALENDAR' => [], 'VEVENT' => [], 'VTODO' => [], 'VJOURNAL' => [], 'VTIMEZONE' => []];
		$componentStart = null;
		$componentEnd = null;
		$componentId = null;
		$componentType = null;

		fseek($stream, 0);
		while(!feof($stream)) {
			$data = fgets($stream);

			if ($data === false || empty(trim($data))) {
				continue;
			}
			
			if (ctype_space($data[0]) === false) {
			
				if (str_starts_with($data, 'BEGIN:')) {
					$type = trim(substr($data, 6));
					if (in_array($type, $tags)) {
						$componentStart = ftell($stream) - strlen($data);
						$componentType = $type;
					}
					unset($type);
				}
				
				if (str_starts_with($data, 'END:')) {
					$type = trim(substr($data, 4));
					if ($componentType === $type) {
						$componentEnd = ftell($stream);
					}
					unset($type);
				}

				if ($componentStart !== null && str_starts_with($data, 'UID:')) {
					$componentId = trim(substr($data, 5));
				}

				if ($componentStart !== null && str_starts_with($data, 'TZID:')) {
					$componentId = trim(substr($data, 5));
				}
				
			}

			if ($componentStart === null) {
				if (!str_starts_with($data, 'BEGIN:VCALENDAR') && !str_starts_with($data, 'END:VCALENDAR')) {
					$components['VCALENDAR'][] = $data;
				}
			}

			if ($componentEnd !== null) {
				if ($componentId !== null) {
					$components[$componentType][$componentId][] = [
						$componentType,
						$componentId,
						$componentStart,
						$componentEnd	
					];
				} else {
					$components[$componentType][] = [
						$componentType,
						$componentId,
						$componentStart,
						$componentEnd	
					];
				}
				$componentId = null;
				$componentType = null;
				$componentStart = null;
				$componentEnd = null;
			}
			
		}
		
		return $components;
	}

	private function extractICalData($stream, int $start, $end): string {
	
		fseek($stream, $start);
		return fread($stream, $end - $start);

	}

}

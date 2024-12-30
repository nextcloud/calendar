<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Export;

use Generator;
use OCP\Calendar\CalendarExportRange;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarExport;
use Sabre\VObject\Component;
use Sabre\VObject\Writer;

class ExportService {
	
	public const FORMATS = ['ical', 'jcal', 'xcal'];

	public function __construct() {}

	/**
	 * Retrieves calendar object, converts each object to appropriate format and streams output
	 */
	public function export(ICalendar&ICalendarExport $calendar, string $format, ?CalendarExportRange $range = null): Generator {

		yield $this->exportStart($format);

		// iterate through each returned vCalendar entry
		// extract each vObject type, convert to appropriate format and output
		// extract any vTimezones objects and save them but do not output
		$timezones = [];
		foreach ($calendar->export($range) as $entry) {
			$consecutive = false;
			foreach ($entry->getComponents() as $vComponent) {
				if ($vComponent->name !== 'VTIMEZONE') {
					yield $this->exportObject($vComponent, $format, $consecutive);
					$consecutive = true;
				}
				if ($vComponent->name === 'VTIMEZONE') {
					if (isset($vComponent->TZID) && !isset($timezones[$vComponent->TZID->getValue()])) {
						$timezones[$vComponent->TZID->getValue()] = clone $vComponent;
					}
				}
			}
		}
		// iterate through each vTimezone entry, convert to appropriate format and output
		foreach ($timezones as $vComponent) {
			yield $this->exportObject($vComponent, $format, $consecutive);
			$consecutive = true;
		}

		yield $this->exportFinish($format);

	}

	/**
	 * Generates appropriate output start based on selected format
	 */
	private function exportStart(string $format): string {
		return match ($format) {
			'jcal' => '["vcalendar",[["version",{},"text","2.0"],["prodid",{},"text","-\/\/IDN nextcloud.com\/\/Calendar App\/\/EN"]],[',
			'xcal' => '<?xml version="1.0" encoding="UTF-8"?><icalendar xmlns="urn:ietf:params:xml:ns:icalendar-2.0"><vcalendar><properties><version><text>2.0</text></version><prodid><text>-//IDN nextcloud.com//Calendar App//EN</text></prodid></properties><components>',
			default => "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//IDN nextcloud.com//Calendar App//EN\n"
		};
	}

	/**
	 * Generates appropriate output end based on selected format
	 */
	private function exportFinish(string $format): string {
		return match ($format) {
			'jcal' => ']]',
			'xcal' => '</components></vcalendar></icalendar>',
			default => "END:VCALENDAR\n"
		};
	}

	/**
	 * Generates appropriate output content for a component based on selected format
	 */
	private function exportObject(Component $vobject, string $format, bool $consecutive): string {
		return match ($format) {
			'jcal' => $consecutive ? ',' . Writer::writeJson($vobject) : Writer::writeJson($vobject),
			'xcal' => $this->exportObjectXml($vobject),
			default => Writer::write($vobject)
		};
	}
	
	/**
	 * Generates appropriate output content for a component for xml format
	 */
	private function exportObjectXml(Component $vobject): string {
		$writer = new \Sabre\Xml\Writer();
        $writer->openMemory();
        $writer->setIndent(false);
        $vobject->xmlSerialize($writer);
        return $writer->outputMemory();
	}

}

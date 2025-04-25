<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Appointments;

use Sabre\VObject\Component;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Component\VTimeZone;
use Sabre\VObject\TimeZoneUtil;
use function max;
use function min;

class TimezoneGenerator {
	/**
	 * Returns a VTIMEZONE component for a Olson timezone identifier
	 * with daylight transitions covering the given date range.
	 *
	 * @link https://gist.github.com/thomascube/47ff7d530244c669825736b10877a200
	 *
	 * @param string $timezone Timezone
	 * @param integer $from Unix timestamp with first date/time in this timezone
	 * @param integer $to Unix timestap with last date/time in this timezone
	 * @psalm-suppress NoValue
	 *
	 * @return null|VTimeZone A Sabre\VObject\Component object representing a VTIMEZONE definition
	 *                        or null if no timezone information is available
	 */
	public function generateVtimezone(string $timezone, int $from, int $to): ?VTimeZone {
		try {
			$tz = new \DateTimeZone($timezone);
		} catch (\Exception $e) {
			return null;
		}

		// get all transitions for one year back/ahead
		$year = 86400 * 360;
		$transitions = $tz->getTransitions($from - $year, $to + $year);

		$vcalendar = new VCalendar();
		$vtimezone = $vcalendar->createComponent('VTIMEZONE');
		$vtimezone->TZID = $timezone;

		$standard = $daylightStart = null;
		foreach ($transitions as $i => $trans) {
			$component = null;
			// daylight saving time definition
			if ($trans['isdst']) {
				$daylightDefinition = $trans['ts'];
				$daylightStart = $vcalendar->createComponent('DAYLIGHT');
				$component = $daylightStart;
			}
			// standard time definition
			else {
				$standardDefinition = $trans['ts'];
				$standard = $vcalendar->createComponent('STANDARD');
				$component = $standard;
			}

			if ($component) {
				if ($i === 0) {
					$date = new \DateTime('19700101T000000');
					$tzfrom = $trans['offset'] / 3600;
					$offset = $tzfrom;
				} else {
					$date = new \DateTime($trans['time']);
					$offset = $trans['offset'] / 3600;
				}

				$component->DTSTART = $date->format('Ymd\THis');
				$component->TZOFFSETFROM = sprintf('%s%02d%02d', $tzfrom >= 0 ? '+' : '-', abs(floor($tzfrom)), ((float)$tzfrom - floor($tzfrom)) * 60.0);
				$component->TZOFFSETTO = sprintf('%s%02d%02d', $offset >= 0 ? '+' : '-', abs(floor($offset)), ((float)$offset - floor($offset)) * 60.0);

				// add abbreviated timezone name if available
				if (!empty($trans['abbr'])) {
					$component->TZNAME = $trans['abbr'];
				}

				$tzfrom = $offset;
				$vtimezone->add($component);
			}

			// we covered the entire date range
			if ($standard && $daylightStart && min($standardDefinition, $daylightDefinition) < $from && max($standardDefinition, $daylightDefinition) > $to) {
				break;
			}
		}

		// add X-MICROSOFT-CDO-TZID if available
		$microsoftExchangeMap = array_flip(TimeZoneUtil::$microsoftExchangeMap);
		if (!empty($microsoftExchangeMap) && array_key_exists($tz->getName(), $microsoftExchangeMap)) {
			$vtimezone->add('X-MICROSOFT-CDO-TZID', $microsoftExchangeMap[$tz->getName()]);
		}

		return $vtimezone;
	}
}

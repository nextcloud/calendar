<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Service\Appointments;

use DateInterval;
use DatePeriod;
use DateTimeImmutable;
use DateTimeZone;
use OCA\Calendar\Db\AppointmentConfig;
use OCP\AppFramework\Utility\ITimeFactory;
use function ceil;
use function max;
use function min;

class AvailabilityGenerator {

	/** @var ITimeFactory */
	private $timeFactory;

	public function __construct(ITimeFactory $timeFactory) {
		$this->timeFactory = $timeFactory;
	}

	/**
	 * Generate intervals at which the user is generally available
	 *
	 * @param AppointmentConfig $config
	 * @param int $start
	 * @param int $end
	 *
	 * @return Interval[]
	 */
	public function generate(AppointmentConfig $config,
							 int $start,
							 int $end): array {
		$now = $this->timeFactory->getTime();

		$bufferBeforeStart = ($config->getTimeBeforeNextSlot() ?? 0);
		$earliestStart = max(
			$start,
			$now + $bufferBeforeStart,
			($config->getStart() ?? $now) + $bufferBeforeStart
		);
		// Always round to "beautiful" slot starts according to slot length
		// E.g. 5m slots should only be available at 10:20 and 10:25, not at 10:17
		//      when the user opens the page at 10:17.
		// But only do this when the time isn't already a "pretty" time
		if ($earliestStart % $config->getIncrement() !== 0) {
			$roundTo = (int)round(($config->getIncrement()) / 300) * 300;
			$earliestStart = (int)ceil($earliestStart / $roundTo) * $roundTo;
		}

		$latestEnd = min(
			$end,
			$config->getEnd() ?? $end
		);

		// If we reach this state then there are no available dates anymore
		if ($latestEnd <= $earliestStart) {
			return [];
		}

		if (empty($config->getAvailability())) {
			// No availability -> full time range is available
			return [
				new Interval($earliestStart, $latestEnd),
			];
		}

		$availabilityRule = json_decode($config->getAvailability(), true);

		$timeZone = $availabilityRule['timezoneId'];
		$slots = $availabilityRule['slots'];

		$applicableSlots = $this->filterDates($start, $slots, $timeZone);

		$intervals = [];
		foreach ($applicableSlots as $slot) {
			if ($slot->getEnd() <= $earliestStart || $slot->getStart() >= $latestEnd) {
				continue;
			}
			$startSlot = max(
				$earliestStart,
				$slot->getStart()
			);
			$endSlot = min(
				$latestEnd,
				$slot->getEnd()
			);
			$intervals[] = new Interval($startSlot, $endSlot);
		}
		return $intervals;
	}

	/**
	 * @param int $start
	 * @param array $availabilityArray
	 * @param string $timeZone
	 *
	 * @return Interval[]
	 */
	private function filterDates(int $start, array $availabilityArray, string $timeZone): array {
		$tz = new DateTimeZone($timeZone);
		// First, transform all timestamps to DateTime Objects
		$availabilityRules = [];
		foreach ($availabilityArray as $key => $availabilitySlots) {
			if (empty($availabilitySlots)) {
				$availabilityRules[$key] = [];
				continue;
			}
			foreach ($availabilitySlots as $slot) {
				$availabilityRules[$key][] = [
					'start' => (new DateTimeImmutable())->setTimezone($tz)->setTimestamp($slot['start']),
					'end' => (new DateTimeImmutable())->setTimezone($tz)->setTimestamp($slot['end'])
				];
			}
		}

		// get the period the check can apply to

		$period = new DatePeriod(
			(new DateTimeImmutable())->setTimezone($tz)->setTimestamp($start - 87600)->setTime(0, 0),
			new DateInterval('P1D'),
			(new DateTimeImmutable())->setTimezone($tz)->setTimestamp($start + 87600)->setTime(23, 59)
		);

		/** @var Interval[] $applicable */
		$applicable = [];
		foreach ($period as $item) {
			/** @var DateTimeImmutable $item */

			// get the weekday from our item and select the applicable rule
			$weekday = strtoupper(mb_strcut($item->format('D'), 0, 2));
			/** @var DateTimeImmutable[][] $dailyRules */
			$dailyRules = $availabilityRules[$weekday];
			// days with no rule should be treated as unavailable
			if (empty($dailyRules)) {
				continue;
			}
			foreach ($dailyRules as $dailyRule) {
				$dStart = $dailyRule['start'];
				$dEnd = $dailyRule['end'];
				$applicable[] = new Interval(
					$item->setTime((int)$dStart->format('H'), (int)$dStart->format('i'))->getTimestamp(),
					$item->setTime((int)$dEnd->format('H'), (int)$dEnd->format('i'))->getTimestamp()
				);
			}
		}
		return $applicable;
	}
}

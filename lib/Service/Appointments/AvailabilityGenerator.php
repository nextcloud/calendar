<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service\Appointments;

use DateInterval;
use DatePeriod;
use DateTimeImmutable;
use DateTimeZone;
use OCA\Calendar\Db\AppointmentConfig;
use OCP\AppFramework\Utility\ITimeFactory;
use Psr\Log\LoggerInterface;
use function ceil;
use function max;
use function min;

class AvailabilityGenerator {
	/** @var ITimeFactory */
	private $timeFactory;

	public function __construct(
		ITimeFactory $timeFactory,
		private LoggerInterface $logger,
	) {
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

		// Always round to "beautiful" slot starts
		// E.g. 5m slots should only be available at 10:20 and 10:25, not at 10:17
		//      when the user opens the page at 10:17.
		// But only do this when the time isn't already a "pretty" time
		if ($earliestStart % $config->getIncrement() !== 0) {
			$roundTo = (int)round((float)$config->getIncrement() / 300.0) * 300;
			$earliestStart = (int)(ceil((float)$earliestStart / (float)$roundTo) * (float)$roundTo);
		}

		$latestEnd = min(
			$end,
			$config->getEnd() ?? $end
		);

		$this->logger->debug("Earliest start: $earliestStart, latest end: $latestEnd", ['app' => 'calendar-appointments']);

		// If we reach this state then there are no available dates anymore
		if ($latestEnd <= $earliestStart) {
			$this->logger->debug('Appointment config ' . $config->getToken() . ' has {latestEnd} as latest end but {earliestStart} as earliest start. No slots available.', [
				'latestEnd' => $latestEnd,
				'earliestStart' => $earliestStart,
				'app' => 'calendar-appointments'
			]);
			return [];
		}

		if (empty($config->getAvailability())) {
			// No availability -> full time range is available
			$this->logger->debug('Full time range available', ['app' => 'calendar-appointments']);
			return [
				new Interval($earliestStart, $latestEnd),
			];
		}

		$availabilityRule = json_decode($config->getAvailability(), true);

		$timeZone = $availabilityRule['timezoneId'];
		$slots = $availabilityRule['slots'];

		$applicableSlots = $this->filterDates($start, $slots, $timeZone, $config->getIncrement());
		$this->logger->debug('Found ' . count($applicableSlots) . ' applicable slot(s) after date filtering', ['app' => 'calendar-appointments']);

		$intervals = [];
		foreach ($applicableSlots as $slot) {
			$this->logger->debug('Slot start: ' . $slot->getStart() . ', slot end: ' . $slot->getEnd(), ['app' => 'calendar-appointments']);
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
	private function filterDates(int $start, array $availabilityArray, string $timeZone, int $duration): array {
		$tz = new DateTimeZone($timeZone);
		// First, transform all timestamps to DateTime Objects
		$availabilityRules = [];
		foreach ($availabilityArray as $key => $availabilitySlots) {
			if (empty($availabilitySlots)) {
				$availabilityRules[$key] = [];
				continue;
			}
			foreach ($availabilitySlots as $slot) {
				// Fix "not-pretty" timeslots
				// A slot from 10:10 to 10:40 could be generated but isn't bookable
				// So we round them to the next highest time that is pretty for that slot
				$roundTo = (int)round(($duration) / 300) * 300;
				$prettyStart = (int)ceil($slot['start'] / $roundTo) * $roundTo;
				$prettyEnd = (int)ceil($slot['end'] / $roundTo) * $roundTo;
				$availabilityRules[$key][] = [
					'start' => (new DateTimeImmutable())->setTimezone($tz)->setTimestamp($prettyStart),
					'end' => (new DateTimeImmutable())->setTimezone($tz)->setTimestamp($prettyEnd)
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

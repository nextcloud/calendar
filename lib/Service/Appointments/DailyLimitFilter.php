<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service\Appointments;

use OCA\Calendar\Db\AppointmentConfig;
use OCP\Calendar\ICalendarQuery;
use OCP\Calendar\IManager;
use Psr\Log\LoggerInterface;
use function array_filter;
use function array_values;
use function count;

class DailyLimitFilter {
	/** @var IManager */
	private $calendarManger;

	public function __construct(
		IManager $calendarManger,
		private LoggerInterface $logger,
	) {
		$this->calendarManger = $calendarManger;
	}

	/**
	 * @param AppointmentConfig $config
	 * @param Interval[] $slots
	 *
	 * @return Interval[]
	 */
	public function filter(AppointmentConfig $config, array $slots): array {
		$this->logger->debug('Slots before daily limit filtering:' . count($slots), ['app' => 'calendar-appointments']);
		if (empty($slots)) {
			return [];
		}
		// 0. If there is no limit then we don't have to filter anything
		if ($config->getDailyMax() === null) {
			return $slots;
		}

		// 1. Find all days
		$days = [];
		foreach ($slots as $slot) {
			$startOfDay = $slot->getStartAsObject()->setTime(0, 0, 0, 0);
			$ts = $startOfDay->getTimestamp();
			$days[$ts] = $startOfDay;
		}

		// 2. Check what days are bookable
		/** @var ICalendarQuery $query */
		$query = $this->calendarManger->newQuery($config->getPrincipalUri());
		// Note: the query is not limited to the target calendar so that the user can
		//         1. Move the event to another calendar
		//         2. Update the config to write to another calendar
		//       Also, the CalDAV back-end currently only indexes some event properties
		//       and our X-* property isn't one of them. Therefore we have to do the
		//       filtering in PHP rather than on the DB.
		$available = [];
		foreach ($days as $ts => $day) {
			$nextDay = $day->modify('+1 day');
			$query->setTimerangeStart($day);
			$query->setTimerangeEnd($nextDay);

			$events = $this->calendarManger->searchForPrincipal($query);

			$eventsOfSameAppointment = array_filter($events, function (array $event) use ($config) {
				$isAppointment = ($event['objects'][0]['X-NC-APPOINTMENT'][0][0] ?? null) === $config->getToken();
				$isCancelled = ($event['objects'][0]['STATUS'][0] ?? null) === 'CANCELLED';
				$isFree = ($event['objects'][0]['TRANSP'][0] ?? null) === 'TRANSPARENT';

				return $isAppointment && !$isCancelled && !$isFree;
			});

			// Only days with less than the max number are still available
			$available[$ts] = count($eventsOfSameAppointment) < $config->getDailyMax();
		}

		// 3. Filter out the slots that are on an unavailable day
		$available = array_values(array_filter($slots, function (Interval $slot) use ($available): bool {
			$startOfDay = $slot->getStartAsObject()->setTime(0, 0, 0, 0);
			$ts = $startOfDay->getTimestamp();
			return $available[$ts];
		}));

		$this->logger->debug('Slots after daily limit filtering:' . count($available), ['app' => 'calendar-appointments']);
		return $available;
	}
}

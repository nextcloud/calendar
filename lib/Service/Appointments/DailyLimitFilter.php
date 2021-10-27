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

use OC\Calendar\CalendarQuery;
use OCA\Calendar\Db\AppointmentConfig;
use OCP\Calendar\IManager;
use function array_filter;
use function array_values;
use function count;

class DailyLimitFilter {

	/** @var IManager */
	private $calendarManger;

	public function __construct(IManager $calendarManger) {
		$this->calendarManger = $calendarManger;
	}

	/**
	 * @param AppointmentConfig $config
	 * @param Interval[] $slots
	 *
	 * @return Interval[]
	 */
	public function filter(AppointmentConfig $config, array $slots): array {
		// 0. If there is no limit then we don't have to filter anything
		if ($config->getDailyMax() === 0) {
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
		/** @var CalendarQuery $query */
		$query = $this->calendarManger->newQuery($config->getPrincipalUri());
		$query->addSearchCalendar($config->getTargetCalendarUri());
		$query->addSearchProperty('X-NC-APPOINTMENT');
		$query->setSearchPattern($config->getToken());
		$available = [];
		foreach ($days as $ts => $day) {
			$nextDay = $day->modify('+1 day');
			$query->setTimerangeStart($day);
			$query->setTimerangeEnd($nextDay);

			$events = $this->calendarManger->searchForPrincipal($query);

			// Only days with less than the max number are still available
			$available[$ts] = count($events) < $config->getDailyMax();
		}

		// 3. Filter out the slots that are on an unavailable day
		return array_values(array_filter($slots, function(Interval $slot) use ($available): bool {
			$startOfDay = $slot->getStartAsObject()->setTime(0, 0, 0, 0);
			$ts = $startOfDay->getTimestamp();
			return $available[$ts];
		}));
	}
}

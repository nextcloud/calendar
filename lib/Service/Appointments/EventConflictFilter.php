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
use DateTimeInterface;
use OCA\Calendar\Db\AppointmentConfig;
use OCP\Calendar\IManager;
use Psr\Log\LoggerInterface;
use function array_filter;

class EventConflictFilter {
	/** @var IManager */
	private $calendarManager;
	private $logger;

	public function __construct(IManager $calendarManager,
		LoggerInterface $logger) {
		$this->calendarManager = $calendarManager;
		$this->logger = $logger;
	}

	/**
	 * Filter appointment slots to those that do not conflict with existing calendar events
	 *
	 * @todo try to combine slots a bit to lower the number of calendar queries
	 *
	 * @param AppointmentConfig $config
	 * @param Interval[] $slots
	 *
	 * @return Interval[]
	 */
	public function filter(AppointmentConfig $config, array $slots): array {
		$this->logger->debug('Slots before event conflict filtering:' . count($slots), ['app' => 'calendar-appointments']);
		if(empty($slots)) {
			return [];
		}
		$query = $this->calendarManager->newQuery($config->getPrincipalUri());
		foreach ($config->getCalendarFreebusyUrisAsArray() as $uri) {
			$query->addSearchCalendar($uri);
		}
		// Always check the target calendar for conflicts
		$query->addSearchCalendar($config->getTargetCalendarUri());
		$query->addType('VEVENT');
		$preparationDuration = DateInterval::createFromDateString($config->getPreparationDuration() . ' seconds');
		$followUpDuration = DateInterval::createFromDateString($config->getFollowupDuration() . ' seconds');
		$available = array_filter($slots, function (Interval $slot) use ($followUpDuration, $preparationDuration, $query, $config): bool {
			$query->setTimerangeStart($slot->getStartAsObject()->sub($preparationDuration));
			$query->setTimerangeEnd($slot->getEndAsObject()->add($followUpDuration));

			$events = $this->calendarManager->searchForPrincipal($query);

			$objects = array_filter($events, static function (array $event) {
				$isCancelled = ($event['objects'][0]['STATUS'][0] ?? null) === 'CANCELLED';
				$isFree = ($event['objects'][0]['TRANSP'][0] ?? null) === 'TRANSPARENT';
				return !$isCancelled && !$isFree;
			});

			$uids = array_map(static function ($object) {
				return $object['uid'];
			}, $objects);

			$this->logger->debug('Appointment config ' . $config->getToken() . ' is looking within {start} and {followup} in calendar {calendarUri}. Conflicting UIDs are {uids}', [
				'start' => $slot->getStartAsObject()->sub($preparationDuration)->format(DateTimeInterface::ATOM),
				'followup' => $slot->getEndAsObject()->add($followUpDuration)->format(DateTimeInterface::ATOM),
				'calendarUri' => $config->getTargetCalendarUri(),
				'uids' => implode(' : ', $uids)
			]);

			// If there is at least one event at this time then the slot is taken
			return empty($objects);
		});

		$this->logger->debug('Slots after event conflict filtering:' . count($available), ['app' => 'calendar-appointments']);
		return $available;
	}
}

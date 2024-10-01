<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
		if (empty($slots)) {
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

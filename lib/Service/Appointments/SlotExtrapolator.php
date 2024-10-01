<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Appointments;

use OCA\Calendar\Db\AppointmentConfig;
use Psr\Log\LoggerInterface;

class SlotExtrapolator {

	public function __construct(
		private LoggerInterface $logger,
	) {

	}
	/**
	 * @param AppointmentConfig $config
	 * @param Interval[] $availabilityIntervals
	 *
	 * @return Interval[]
	 */
	public function extrapolate(AppointmentConfig $config,
		array $availabilityIntervals): array {
		$this->logger->debug('Intervals before extrapolating:' . count($availabilityIntervals), ['app' => 'calendar-appointments']);
		if (empty($availabilityIntervals)) {
			return [];
		}
		foreach ($availabilityIntervals as $availabilityInterval) {
			$this->logger->debug('Interval start: ' . $availabilityInterval->getStart() . ', interval end: ' . $availabilityInterval->getEnd(), ['app' => 'calendar-appointments']);
		}
		$increment = $config->getIncrement();
		$length = $config->getLength();
		$slots = [];

		foreach ($availabilityIntervals as $available) {
			$from = $available->getStart();
			$to = $available->getEnd();

			for ($t = $from; ($t + $length) <= $to; $t += $increment) {
				$slots[] = new Interval($t, $t + $length);
			}
		}

		$this->logger->debug('Slots after extrapolating:' . count($slots), ['app' => 'calendar-appointments']);
		return $slots;
	}
}

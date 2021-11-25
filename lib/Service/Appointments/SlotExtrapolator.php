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

use OCA\Calendar\Db\AppointmentConfig;

class SlotExtrapolator {

	/**
	 * @param AppointmentConfig $config
	 * @param Interval[] $availabilityIntervals
	 * @param int $to
	 *
	 * @return Interval[]
	 */
	public function extrapolate(AppointmentConfig $config,
								array $availabilityIntervals): array {
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

		return $slots;
	}
}

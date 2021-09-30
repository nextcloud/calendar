<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Appointments;

use OCA\Calendar\Db\AppointmentConfig;

class Booking {

	/** @var AppointmentConfig */
	private $appointmentConfig;

	/** @var int */
	private $startTime;

	/** @var int */
	private $endTime;

	/** @var Slot[] */
	private $slots;

	/**
	 * @return int
	 */
	public function getStartTime(): int {
		return $this->startTime;
	}

	/**
	 * @param int $startTime
	 */
	public function setStartTime(int $startTime): void {
		$this->startTime = $startTime;
	}

	/**
	 * @return int
	 */
	public function getEndTime(): int {
		return $this->endTime;
	}

	/**
	 * @param int $endTime
	 */
	public function setEndTime(int $endTime): void {
		$this->endTime = $endTime;
	}

	/**
	 * @return Slot[]
	 */
	public function getSlots(): array {
		return $this->slots;
	}

	/**
	 * @param Slot[] $slots
	 */
	public function setSlots(array $slots): void {
		$this->slots = $slots;
	}

	/**
	 * @return AppointmentConfig
	 */
	public function getAppointmentConfig(): AppointmentConfig {
		return $this->appointmentConfig;
	}

	/**
	 * @param AppointmentConfig $appointmentConfig
	 */
	public function setAppointmentConfig(AppointmentConfig $appointmentConfig): void {
		$this->appointmentConfig = $appointmentConfig;
	}


	public function generateSlots(): array {
		$slots = [];
		$unixStartTime = $this->getStartTime();
		while(($unixStartTime + $this->getAppointmentConfig()->getTotalLength()*60) <= $this->getEndTime() ) {
			$slots[] = new Slot($unixStartTime, $unixStartTime+$this->getAppointmentConfig()->getTotalLength()*60);
			$unixStartTime += $this->getAppointmentConfig()->getIncrement();
		}
		$this->slots = $slots;
		return $slots;
	}

	/**
	 * @return Slot[]
	 */
	public function parseRRule(): array {
		$rrule = $this->appointmentConfig->getAvailability();
		// if a slot is not in the timerange, unset that slot from this->slots
		return [new Slot(1,1)]; // stub
	}

	/**
	 * @param int $booked
	 * @return int
	 */
	public function getAvailableSlots(int $booked): int {
		return ($this->appointmentConfig->getDailyMax() !==  null) ? $this->appointmentConfig->getDailyMax() - $booked : 99999;
	}
}

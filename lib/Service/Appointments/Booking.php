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

namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use OCA\Calendar\Db\AppointmentConfig;
use Recurr\Exception\InvalidRRule;
use Recurr\Exception\InvalidWeekday;
use Recurr\Recurrence;
use Recurr\Rule;
use Recurr\Transformer\ArrayTransformer;
use Recurr\Transformer\ArrayTransformerConfig;

class Booking {

	/** @var AppointmentConfig */
	private $appointmentConfig;

	/** @var int */
	private $startTime;

	/** @var int */
	private $endTime;

	/** @var Slot[] */
	private $slots;

	public function __construct(AppointmentConfig $appointmentConfig, int $startTime, int $endTime, array $slots = []) {
		$this->appointmentConfig = $appointmentConfig;
		$this->startTime = $startTime;
		$this->endTime = $endTime;
		$this->slots = $slots;
	}
	/**
	 * @return int
	 */
	public function getStartTime(): int {
		return $this->startTime;
	}

	// Trait maybe?
	public function getStartTimeDTObj() : DateTimeImmutable {
		return (new DateTimeImmutable())->setTimestamp($this->startTime);
	}

	public function getEndTimeDTObj() : DateTimeImmutable {
		return (new DateTimeImmutable())->setTimestamp($this->endTime);
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
		$length = $this->getAppointmentConfig()->getTotalLength()*60;
		while(($unixStartTime + $length) <= $this->getEndTime() ) {
			$slots[] = new Slot($unixStartTime, $unixStartTime+$this->getAppointmentConfig()->getTotalLength()*60);
			$unixStartTime += $this->getAppointmentConfig()->getIncrement()*60;
		}
		$this->slots = $slots;
		return $slots;
	}

	/**
	 * @param int $booked
	 * @return int
	 */
	public function getAvailableSlotsAmount(int $booked): int {
		return ($this->appointmentConfig->getDailyMax() !== null) ? $this->appointmentConfig->getDailyMax() - $booked : 99999;
	}

	/**
	 * @return self;
	 */
	public function parseRRule(): self {
		try {
			// RRule Array Transformer does not work with constraints atm
			// so this is (kind of) superfluous
			$startDT = $this->getStartTimeDTObj();
			$endDT = $this->getEndTimeDTObj();
			// force UTC
			$startDT->setTimezone(new \DateTimeZone('UTC'));
			$endDT->setTimezone(new \DateTimeZone('UTC'));
			$rule = new Rule($this->appointmentConfig->getAvailability());
		} catch (InvalidRRule $e) {
			$this->slots = [];
			return $this;
		}

		$config = new ArrayTransformerConfig();
		$config->enableLastDayOfMonthFix();

		$transformer = new ArrayTransformer();
		$transformer->setConfig($config);

		try {
			$collection = $transformer->transform($rule);
		} catch (InvalidWeekday $e) {
			// throw an error here?
			$this->slots = [];
			return $this;
		}

		$this->slots = $collection->map(function (Recurrence $slot) {
			$start = $slot->getStart()->getTimestamp();
			$end = $start + ($this->appointmentConfig->getTotalLength() * 60);
			return new Slot($start, $end);
		})->toArray();

		return $this;
	}
}

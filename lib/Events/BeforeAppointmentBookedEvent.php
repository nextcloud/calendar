<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Events;

use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCP\EventDispatcher\Event;

class BeforeAppointmentBookedEvent extends Event {

	/** @var Booking */
	private $booking;
	/** @var AppointmentConfig */

	private $config;

	public function __construct(Booking $booking, AppointmentConfig $config) {
		parent::__construct();

		$this->booking = $booking;
		$this->config = $config;
	}

	public function getBooking(): Booking {
		return $this->booking;
	}

	public function getConfig(): AppointmentConfig {
		return $this->config;
	}
}

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

	public function __construct(
		private Booking $booking,
		private AppointmentConfig $config,
	) {
		parent::__construct();
	}

	public function getBooking(): Booking {
		return $this->booking;
	}

	public function getConfig(): AppointmentConfig {
		return $this->config;
	}
}

<?php

declare(strict_types=1);

/*
 * @copyright 2022 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2022 Christoph Wurst <christoph@winzerhof-wurst.at>
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

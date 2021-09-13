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

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use Recurr\Exception\InvalidRRule;
use Recurr\Exception\InvalidWeekday;
use Recurr\Recurrence;
use Recurr\Rule;
use Recurr\Transformer\ArrayTransformer;
use Recurr\Transformer\ArrayTransformerConfig;

class BookingTest extends TestCase {

	/** @var Booking */
	private $booking;
	/** @var AppointmentConfig */
	private $appointmentConfig;

	protected function setUp(): void {
		parent::setUp();
		$this->appointmentConfig = new AppointmentConfig();
		$this->booking = new Booking($this->appointmentConfig,strtotime('midnight'), (strtotime('midnight') + 84000));
	}

	/**
	 * @covers Booking::getAppointmentConfig()
	 * @covers Booking::setAppointmentConfig()
	 */
	public function testSetAppointmentConfig(): void {
		$this->appointmentConfig = new AppointmentConfig();
		$this->booking->setAppointmentConfig($this->appointmentConfig);

		$this->assertEquals($this->booking->getAppointmentConfig(), $this->appointmentConfig);
	}

}

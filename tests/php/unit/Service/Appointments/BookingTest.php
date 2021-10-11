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
use DateTime;
use DateTimeImmutable;
use OCA\Calendar\Db\AppointmentConfig;
use Recurr\Exception\InvalidRRule;
use Recurr\Exception\InvalidWeekday;
use Recurr\Recurrence;
use Recurr\Rule;
use Recurr\Transformer\ArrayTransformer;
use Recurr\Transformer\ArrayTransformerConfig;
use Sabre\VObject\Property\VCard\Date;
use function foo\func;

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

	public function testIntersectRRule(){
		$time = strtotime('midnight');
		$this->appointmentConfig->setLength(30);
		$this->appointmentConfig->setIncrement(15);
		$this->appointmentConfig->setPreparationDuration(15);
		$this->appointmentConfig->setFollowupDuration(15);
		$this->appointmentConfig->setAvailability("RRULE:FREQ=MINUTELY;INTERVAL=15;WKST=MO;BYDAY=MO;BYHOUR=8,9,10,11");

		try {
			$startDT = new \DateTime();
			$startDT->setTimestamp($this->booking->getStartTime());

			// force UTC
			$startDT->setTimezone(new \DateTimeZone('UTC'));
			$rule = new Rule($this->appointmentConfig->getAvailability(), $startDT);
		} catch (InvalidRRule $e) {
			return [];
		}

		$config = new ArrayTransformerConfig();
		$config->enableLastDayOfMonthFix();

		$transformer = new ArrayTransformer();
		$transformer->setConfig($config);

		try {
			$collection = $transformer->transform($rule);
		} catch (InvalidWeekday $e) {
			return [];
		}

		$slots = $collection->map(function(Recurrence $slot) {
			$start = $slot->getStart()->getTimestamp();
			$end = $start + ($this->appointmentConfig->getTotalLength() * 60);
			return new Slot($start, $end);
		})->toArray();

		$test = [];
	}
}

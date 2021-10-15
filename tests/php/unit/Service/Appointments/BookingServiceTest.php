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
use OC\Calendar\CalendarQuery;
use OC\Calendar\Manager;
use OCA\DAV\CalDAV\CalDavBackend;
use OCA\DAV\CalDAV\CalendarProvider;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use PHPUnit\Framework\MockObject\MockObject;

class BookingServiceTest extends TestCase {

	/** @var AppointmentConfigMapper|MockObject  */
	private $mapper;

	/** @var BookingService */
	private $service;

	/** @var mixed|Manager|MockObject */
	private $manager;

	protected function setUp(): void {
		parent::setUp();
		$backend = \OC::$server->get(CalDavBackend::class);
		$calendarProvider = new CalendarProvider($backend);
		$this->manager = \OC::$server->get(Manager::class);
		$this->mapper = $this->createMock(AppointmentConfigMapper::class);
		$this->service = new BookingService(
			$this->manager,
			$this->mapper
		);
	}

	public function testGetCalendarFreeTimeblocks() {
		$appointmentConfig = new AppointmentConfig();
		$appointmentConfig->setUserId('admin'); // or something else
		$appointmentConfig->setTargetCalendarUri('calendars/admin/personal/');
		$booking = new Booking($appointmentConfig, time(), (time()+3600) );
		$calendarQuery = new CalendarQuery($appointmentConfig->getPrincipalUri());
		$booking->setAppointmentConfig($appointmentConfig);
		$this->manager->expects($this->once())
			->method('newQuery')
			->with($appointmentConfig->getPrincipalUri())
			->willReturn($calendarQuery);
		$this->manager->expects($this->once())
			->method('searchForPrincipal')
			->with($calendarQuery)
			->willReturn(null);
		$this->service->getCalendarFreeTimeblocks($booking);
	}
}

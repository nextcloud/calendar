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
use OC\Config;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\Booking;
use OCA\Calendar\Service\Appointments\BookingService;
use OCA\DAV\CalDAV\CalDavBackend;
use OCA\DAV\CalDAV\CalendarProvider;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\Calendar\ICalendarProvider;
use OCP\DB\Exception;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Exception\ServiceException;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IUser;
use OCP\IUserSession;
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
//		$this->manager = $this->createMock(Manager::class);
		$backend = \OC::$server->get(CalDavBackend::class);
		$l10n =  $this->createMock(IL10N::class);
		$conf = $this->createMock(IConfig::class);
		$calendarProvider = new CalendarProvider($backend, $l10n, $conf);
		$this->manager = new Manager($calendarProvider);
		$this->mapper = $this->createMock(AppointmentConfigMapper::class);
		$this->service = new BookingService(
			$this->manager,
			$this->mapper
		);
	}

	public function testGetCalendarFreeTimeblocks(){
		$appointmentConfig = new AppointmentConfig();
		$appointmentConfig->setPrincipalUri('principals/users/test');
		$appointmentConfig->setTargetCalendarUri('personal');
		$appointmentConfig ->setLength(30);
		$appointmentConfig ->setIncrement(15);
		$appointmentConfig ->setPreparationDuration(15);
		$appointmentConfig ->setFollowupDuration(15);
		$appointmentConfig ->setAvailability("RRULE:FREQ=MINUTELY;INTERVAL=15;WKST=MO;BYDAY=MO;BYHOUR=8,9,10,11");
		$booking = new Booking($appointmentConfig, time(), (time() + 84600));
		$booking->generateSlots();
		$calendarQuery = new CalendarQuery($appointmentConfig->getPrincipalUri());
		$this->service->getCalendarFreeTimeblocks($booking);
	}

	public function testGetCalendarCount(){
		$appointmentConfig = new AppointmentConfig();
		$appointmentConfig->setPrincipalUri('principals/users/test');
		$appointmentConfig->setTargetCalendarUri('personal');
		$appointmentConfig->setToken('1');
		$appointmentConfig ->setLength(30);
		$appointmentConfig ->setIncrement(15);
		$appointmentConfig ->setPreparationDuration(15);
		$appointmentConfig ->setFollowupDuration(15);
		$appointmentConfig ->setAvailability("RRULE:FREQ=MINUTELY;INTERVAL=15;WKST=MO;BYDAY=MO;BYHOUR=8,9,10,11");
		$booking = new Booking($appointmentConfig, time(), (time() + 84600));
		$count = $this->service->findBookedSlotsAmount($booking);
	}


}

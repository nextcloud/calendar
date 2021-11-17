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
use OC\AppFramework\Bootstrap\Coordinator;
use OC\AppFramework\Bootstrap\RegistrationContext;
use OC\AppFramework\Bootstrap\ServiceRegistration;
use OC\Calendar\Manager;
use OCA\DAV\CalDAV\CalDavBackend;
use OCA\DAV\CalDAV\CalendarProvider;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCP\IConfig;
use OCP\IL10N;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class BookingServiceTest extends TestCase {

	/** @var AppointmentConfigMapper|MockObject  */
	private $mapper;

	/** @var BookingService */
	private $service;

	/** @var mixed|Manager|MockObject */
	private $manager;

	/** @var MailService|MockObject */
	private $mailService;

	protected function setUp(): void {
		parent::setUp();
		$backend = \OC::$server->get(CalDavBackend::class);
		$container = \OC::$server->get(\Psr\Container\ContainerInterface::class);
		$l10n = $this->createMock(IL10N::class);
		$conf = $this->createMock(IConfig::class);
		$logger = $this->createMock(LoggerInterface::class);
		$coordinator = $this->createConfiguredMock(Coordinator::class, [
			'getRegistrationContext' => $this->createConfiguredMock(RegistrationContext::class, [
				'getCalendarProviders' => [ new ServiceRegistration('calendar', CalendarProvider::class) ]
			])
		]);
		$this->manager = new Manager($coordinator, $container, $logger);
		$this->mapper = $this->createMock(AppointmentConfigMapper::class);
		$this->service = new BookingService(
			$this->manager,
			$this->mapper
		);
	}
}

<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
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

namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\EventConflictFilter;
use OCA\Calendar\Service\Appointments\Interval;
use OCP\Calendar\ICalendarQuery;
use OCP\Calendar\IManager;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class EventConflictFilterTest extends TestCase {
	/** @var IManager|MockObject */
	private $calendarManager;

	/** @var EventConflictFilter */
	private $filter;

	/** @var mixed|MockObject|LoggerInterface */
	private $logger;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->calendarManager = $this->createMock(IManager::class);
		$this->logger = $this->createMock(LoggerInterface::class);

		$this->filter = new EventConflictFilter(
			$this->calendarManager,
			$this->logger
		);
	}

	public function testNoConflict(): void {
		$config = new AppointmentConfig();
		$config->setUserId('user1');
		$config->setCalendarFreebusyUris('[]');
		$config->setTargetCalendarUri('personal');
		$config->setPreparationDuration(0);
		$config->setFollowupDuration(0);
		$slots = [
			new Interval(0, 100 * 60),
		];

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame($slots, $filtered);
	}

	public function testConflicts(): void {
		$config = new AppointmentConfig();
		$config->setUserId('user1');
		$config->setCalendarFreebusyUris('[]');
		$config->setTargetCalendarUri('personal');
		$config->setPreparationDuration(0);
		$config->setFollowupDuration(0);
		$slots = [
			new Interval(0, 100 * 60),
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->calendarManager->expects(self::once())
			->method('newQuery')
			->willReturn($query);
		$this->calendarManager->expects(self::once())
			->method('searchForPrincipal')
			->with($query)
			->willReturn([
				['uid' => 'abc'],
			]);

		$filtered = $this->filter->filter($config, $slots);

		self::assertEmpty($filtered);
	}
}

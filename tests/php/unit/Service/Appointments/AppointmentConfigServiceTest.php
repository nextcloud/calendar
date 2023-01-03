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

use ChristophWurst\Nextcloud\Testing\ServiceMockObject;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\IUser;

class AppointmentConfigServiceTest extends TestCase {
	/** @var ServiceMockObject */
	private $serviceMock;

	/** @var AppointmentConfigService */
	private $service;

	protected function setUp(): void {
		parent::setUp();

		$this->serviceMock = $this->createServiceMock(AppointmentConfigService::class);
		$this->service = $this->serviceMock->getService();
	}

	public function testDeleteByUser(): void {
		$user = $this->createMock(IUser::class);
		$user->method('getUid')->willReturn('user123');
		$this->serviceMock->getParameter('mapper')
			->expects(self::once())
			->method('deleteByUserId')
			->with('user123');

		$this->service->deleteByUser($user);
	}
}

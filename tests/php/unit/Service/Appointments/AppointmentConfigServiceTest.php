<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

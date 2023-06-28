<?php

declare(strict_types=1);

/*
 * @copyright 2023 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2023 Christoph Wurst <christoph@winzerhof-wurst.at>
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

namespace OCA\Calendar\Tests\Unit\Service;

use ChristophWurst\Nextcloud\Testing\ServiceMockObject;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\CategoriesService;
use OCP\SystemTag\ISystemTag;
use function array_column;

class CategoriesServiceTest extends TestCase {
	private ServiceMockObject $serviceMock;
	private CategoriesService $service;

	protected function setUp(): void {
		parent::setUp();

		$this->serviceMock = $this->createServiceMock(CategoriesService::class);
		$this->service = $this->serviceMock->getService();

		$this->serviceMock->getParameter('l10n')
			->method('t')
			->willReturnArgument(0);
	}

	public function testGetCategoriesDefaultsOnly(): void {
		$categories = $this->service->getCategories('user123');

		self::assertCount(3, $categories);
		self::assertEquals(
			[
				'Custom Categories',
				'Collaborative Tags',
				'Standard Categories',
			],
			array_column($categories, 'group')
		);
		self::assertCount(0, $categories[0]['options']);
		self::assertCount(0, $categories[1]['options']);
		self::assertCount(15, $categories[2]['options']);
	}

	public function testGetUsedCategories(): void {
		$this->serviceMock->getParameter('calendarManager')
			->expects(self::once())
			->method('searchForPrincipal')
			->willReturn([
				[
					'objects' => [],
				],
				[
					'objects' => [
						[
							'CATEGORIES' => [
								[
									'',
									[],
								]
							],
						],
					],
				],
				[
					'objects' => [
						[
							'CATEGORIES' => [
								[
									'pizza,party',
									[],
								]
							],
						],
					],
				],
				[
					'objects' => [
						[
							'CATEGORIES' => [
								[
									'pizza,hawaii',
									[],
								]
							],
						],
					],
				],
			]);

		$categories = $this->service->getCategories('user123');

		self::assertArrayHasKey(0, $categories);
		self::assertCount(3, $categories[0]['options']);
		self::assertEquals(['pizza', 'party', 'hawaii'], array_column($categories[0]['options'], 'label'));
	}

	public function testGetSystemTagsAsCategories(): void {
		$tag1 = $this->createMock(ISystemTag::class);
		$tag1->method('isUserAssignable')->willReturn(false);
		$tag1->method('isUserVisible')->willReturn(true);
		$tag2 = $this->createMock(ISystemTag::class);
		$tag2->method('isUserAssignable')->willReturn(false);
		$tag2->method('isUserVisible')->willReturn(false);
		$tag3 = $this->createMock(ISystemTag::class);
		$tag3->method('isUserAssignable')->willReturn(true);
		$tag3->method('isUserVisible')->willReturn(true);
		$tag3->method('getName')->willReturn('fun');
		$this->serviceMock->getParameter('systemTagManager')
			->expects(self::once())
			->method('getAllTags')
			->with(true)
			->willReturn([
				$tag1,
				$tag2,
				$tag3,
			]);

		$categories = $this->service->getCategories('user123');

		self::assertArrayHasKey(1, $categories);
		self::assertCount(1, $categories[1]['options']);
		self::assertEquals(['fun'], array_column($categories[1]['options'], 'label'));
	}
}

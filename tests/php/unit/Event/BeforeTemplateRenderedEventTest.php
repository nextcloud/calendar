<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2020 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Event;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\EventDispatcher\Event;

class BeforeTemplateRenderedEventTest extends TestCase {
	public function testInheritEvent(): void {
		$event = new BeforeTemplateRenderedEvent(false, false, null);
		$this->assertInstanceOf(Event::class, $event);
	}

	/**
	 * @param bool $public
	 * @param bool $embedded
	 * @param string|null $tokens
	 */
	public function testGetters(bool $public, bool $embedded, ?string $tokens): void {
		$event = new BeforeTemplateRenderedEvent($public, $embedded, $tokens);

		$this->assertEquals($public, $event->isPublic());
		$this->assertEquals($embedded, $event->isEmbedded());
		$this->assertEquals($tokens, $event->getTokens());
	}

	public function gettersDataProvider(): array {
		return [
			[false, false, null],
			[true, false, 'token123'],
			[true, true, 'token123'],
		];
	}
}

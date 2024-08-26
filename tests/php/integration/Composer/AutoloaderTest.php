<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Integration\Composer;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\Security\ISecureRandom;
use OCP\Server;
use function class_exists;
use function file_exists;
use function file_put_contents;
use function ucfirst;
use function unlink;

class AutoloaderTest extends TestCase {

	/** @var null|string */
	private $testClass = null;

	private static function getClassPath(string $class): string {
		return __DIR__ . '/../../../../lib/' . $class . '.php';
	}

	protected function tearDown(): void {
		parent::tearDown();

		if ($this->testClass !== null && file_exists(self::getClassPath($this->testClass))) {
			unlink(self::getClassPath($this->testClass));
		}
	}

	public function testLoadDynamicClass(): void {
		$rand = Server::get(ISecureRandom::class);
		$className = ucfirst($rand->generate(10, ISecureRandom::CHAR_LOWER));
		$namespace = 'OCA\\Calendar';

		file_put_contents(self::getClassPath($className), <<<FILE
<?php

namespace $namespace;

class $className {}
FILE);
		$this->testClass = $className;

		self::assertTrue(class_exists($namespace . '\\' . $className));
	}

}

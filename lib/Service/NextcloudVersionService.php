<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service;

use OCP\ServerVersion;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;

class NextcloudVersionService {
	private ?ServerVersion $serverVersion;

	public function __construct(
		private readonly ContainerInterface $container,
	) {
	}

	private function getMajorVersion(): int {
		if ($this->serverVersion === null) {
			// ServerVersion was added in 31, but we don't care about older versions anyway
			try {
				/** @var ServerVersion $serverVersion */
				$this->serverVersion = $this->container->get(ServerVersion::class);
			} catch (ContainerExceptionInterface $e) {
				return 0;
			}
		}

		return $this->serverVersion->getMajorVersion();
	}

	public function is31OrAbove(): bool {
		return $this->getMajorVersion() >= 31;
	}
}

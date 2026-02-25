<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\AppInfo;

use OCP\Capabilities\IPublicCapability;

class Capabilities implements IPublicCapability {
	#[\Override]
	public function getCapabilities(): array {
		return [
			'calendar' => [
				'webui' => true,
			],
		];
	}
}

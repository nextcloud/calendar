<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

if (!defined('PHPUNIT_RUN')) {
	define('PHPUNIT_RUN', 1);
}

use OCP\App\IAppManager;
use OCP\Server;

require_once __DIR__ . '/../../../../../lib/base.php';
require_once __DIR__ . '/../../../../../tests/autoload.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

Server::get(IAppManager::class)->loadApp('calendar');

OC_Hook::clear();

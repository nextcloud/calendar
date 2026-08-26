<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

use Rector\Config\RectorConfig;
use Rector\Php80\Rector\Class_\ClassPropertyAssignToConstructorPromotionRector;
use Rector\TypeDeclaration\Rector\Property\TypedPropertyFromStrictConstructorRector;
use Rector\ValueObject\PhpVersion;

return RectorConfig::configure()
	->withPaths([
		__DIR__ . '/appinfo/routes.php',
		__DIR__ . '/lib',
		__DIR__ . '/tests/php',
	])
	->withAutoloadPaths([
		__DIR__ . '/vendor-bin/rector/vendor/nextcloud/ocp/OCP',
	])
	->withPhpVersion(PhpVersion::PHP_82)
	->withRules([
		TypedPropertyFromStrictConstructorRector::class,
	])
	->withConfiguredRule(ClassPropertyAssignToConstructorPromotionRector::class, [
		'inline_public' => true,
		'rename_property' => true,
	]);

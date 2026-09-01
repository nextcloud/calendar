<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\DB\Types;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

class Version5050Date20250701000001 extends SimpleMigrationStep {
	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	#[\Override]
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
		$schema = $schemaClosure();

		if ($schema->hasTable('calendar_proposal_dts')) {
			return $schema;
		}

		$table = $schema->createTable('calendar_proposal_dts');
		$table->addColumn('id', Types::BIGINT, [
			'autoincrement' => true,
			'notnull' => true,
			'unsigned' => true
		]);
		$table->addColumn('uid', Types::STRING, [
			'notnull' => true,
			'length' => 255
		]);
		$table->addColumn('uuid', Types::STRING, [
			'notnull' => true,
			'length' => 36
		]);
		$table->addColumn('title', Types::TEXT, [
			'notnull' => false,
			'length' => 65535
		]);
		$table->addColumn('description', Types::TEXT, [
			'notnull' => false,
			'length' => 65535
		]);
		$table->addColumn('location', Types::TEXT, [
			'notnull' => false,
			'length' => 65535
		]);
		$table->addColumn('duration', Types::INTEGER, [
			'notnull' => true,
			'length' => null
		]);

		$table->setPrimaryKey(['id']);

		return $schema;
	}
}

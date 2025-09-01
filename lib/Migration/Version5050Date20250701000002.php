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

class Version5050Date20250701000002 extends SimpleMigrationStep {
	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	#[\Override]
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
		$schema = $schemaClosure();

		if ($schema->hasTable('calendar_proposal_pts')) {
			return $schema;
		}

		$table = $schema->createTable('calendar_proposal_pts');
		$table->addColumn('id', Types::BIGINT, [
			'autoincrement' => true,
			'notnull' => true,
			'unsigned' => true
		]);
		$table->addColumn('uid', Types::STRING, [
			'notnull' => true,
			'length' => 255
		]);
		$table->addColumn('pid', Types::BIGINT, [
			'notnull' => true,
			'unsigned' => true
		]);
		$table->addColumn('name', Types::STRING, [
			'notnull' => false,
			'length' => 255
		]);
		$table->addColumn('address', Types::STRING, [
			'notnull' => true,
			'length' => 320
		]);
		$table->addColumn('attendance', Types::STRING, [
			'notnull' => false,
			'length' => 8
		]);
		$table->addColumn('status', Types::STRING, [
			'notnull' => false,
			'length' => 8
		]);
		$table->addColumn('realm', Types::STRING, [
			'notnull' => false,
			'length' => 8
		]);
		$table->addColumn('token', Types::STRING, [
			'notnull' => false,
			'length' => 255
		]);

		$table->setPrimaryKey(['id']);

		return $schema;
	}
}

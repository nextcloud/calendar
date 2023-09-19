<?php

declare(strict_types=1);

/**
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

namespace OCA\Calendar\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

class Version3000Date20211109132439 extends SimpleMigrationStep {
	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
		$schema = $schemaClosure();

		$table = $schema->createTable('calendar_appt_bookings');
		$table->addColumn('id', 'bigint', [
			'autoincrement' => true,
			'notnull' => true,
			'length' => 11,
			'unsigned' => true
		]);
		$table->addColumn('appt_config_id', 'bigint', [
			'notnull' => true,
			'length' => 11,
			'unsigned' => true
		]);
		$table->addColumn('created_at', 'integer', [
			'notnull' => true,
			'length' => 4
		]);
		$table->addColumn('token', 'string', [
			'notnull' => true,
			'length' => 32
		]);
		$table->addColumn('display_name', 'string', [
			'notnull' => true,
			'length' => 128
		]);
		$table->addColumn('description', 'text', [
			'notnull' => false,
			'length' => null
		]);
		$table->addColumn('email', 'string', [
			'notnull' => true,
			'length' => 128
		]);
		$table->addColumn('start', 'integer', [
			'notnull' => true,
			'length' => 4
		]);
		$table->addColumn('end', 'integer', [
			'notnull' => true,
			'length' => 4
		]);
		$table->addColumn('timezone', 'string', [
			'notnull' => true,
			'length' => 32
		]);
		$table->addColumn('confirmed', 'boolean', [
			'notnull' => false,
			'default' => false,
		]);

		$table->setPrimaryKey(['id']);
		$table->addUniqueIndex(['token'], 'cal_appt_bk_token_uniq_idx');

		return $schema;
	}
}

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

class Version2040Date20210908101001 extends SimpleMigrationStep {
	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 * @return null|ISchemaWrapper
	 */
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
		$schema = $schemaClosure();

		$table = $schema->createTable('calendar_appt_configs');
		$table->addColumn('id', 'bigint', [
			'autoincrement' => true,
			'notnull' => true,
			'length' => 11,
			'unsigned' => true
		]);
		// Appointment
		$table->addColumn('token', 'string', [
			'notnull' => true,
			'length' => 128
		]);
		// Appointment
		$table->addColumn('name', 'string', [
			'notnull' => true,
			'length' => 128
		]);
		$table->addColumn('description', 'text', [
			'notnull' => false,
			'length' => null
		]);
		$table->addColumn('location', 'text', [
			'notnull' => false,
			'length' => null
		]);
		//Visibility [enum] - PUBLIC (shown somewhere on the user's profile), PRIVATE (only shareable by link) - possibly other variations?
		$table->addColumn('visibility', 'string', [
			'notnull' => true,
			'length' => 10
		]);
		$table->addColumn('user_id', 'string', [
			'notnull' => true,
			'length' => 64
		]);
		$table->addColumn('target_calendar_uri', 'string', [
			'notnull' => true,
			'length' => 255
		]);
		//Calendar(s) for conflict handling [string array]
		$table->addColumn('calendar_freebusy_uris', 'text', [
			'notnull' => false,
			'length' => null
		]);
		//Slot availabilities [RRULE]
		$table->addColumn('availability', 'text', [
			'notnull' => false,
			'length' => null,
		]);
		$table->addColumn('start', 'integer', [
			'notnull' => false,
		]);
		$table->addColumn('end', 'integer', [
			'notnull' => false,
		]);
		$table->addColumn('length', 'integer', [
			'notnull' => true
		]);
		$table->addColumn('increment', 'integer', [
			'notnull' => true
		]);
		$table->addColumn('preparation_duration', 'integer', [
			'notnull' => true,
			'default' => 0
		]);
		$table->addColumn('followup_duration', 'integer', [
			'notnull' => true,
			'default' => 0
		]);
		// Minimum time before next appointment slot can be booked
		$table->addColumn('time_before_next_slot', 'integer', [
			'notnull' => false
		]);
		//Maximum slots per day - if 0, fit as many as possible
		$table->addColumn('daily_max', 'integer', [
			'notnull' => false,
			'default' => null
		]);

		$table->setPrimaryKey(['id']);
		$table->addUniqueIndex(['token'], 'cal_appt_token_uniq_idx');

		return $schema;
	}
}

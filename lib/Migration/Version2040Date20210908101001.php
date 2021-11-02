<?php

declare(strict_types=1);

namespace OCA\Calendar\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\DB\Types;
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
		$table->addColumn('id', Types::BIGINT, [
			'autoincrement' => true,
			'notnull' => true,
			'length' => 11,
			'unsigned' => true
		]);
		// Appointment
		$table->addColumn('token', Types::STRING, [
			'notnull' => true,
			'length' => 128
		]);
		// Appointment
		$table->addColumn('name', Types::STRING, [
			'notnull' => true,
			'length' => 128
		]);
		$table->addColumn('description', Types::TEXT, [
			'notnull' => false,
			'length' => null
		]);
		$table->addColumn('location', Types::TEXT, [
			'notnull' => false,
			'length' => null
		]);
		//Visibility [enum] - PUBLIC (shown somewhere on the user's profile), PRIVATE (only shareable by link) - possibly other variations?
		$table->addColumn('visibility', Types::STRING, [
			'notnull' => true,
			'length' => 10
		]);
		$table->addColumn('user_id', 'string', [
			'notnull' => true,
			'length' => 64
		]);
		$table->addColumn('target_calendar_uri', Types::STRING, [
			'notnull' => true,
			'length' => 255
		]);
		//Calendar(s) for conflict handling [string array]
		$table->addColumn('calendar_freebusy_uris', Types::TEXT, [
			'notnull' => false,
			'length' => null
		]);
		//Slot availabilities [RRULE]
		$table->addColumn('availability', Types::TEXT, [
			'notnull' => false,
			'length' => null,
		]);
		$table->addColumn('start', Types::INTEGER, [
			'notnull' => false,
		]);
		$table->addColumn('end', Types::INTEGER, [
			'notnull' => false,
		]);
		$table->addColumn('length', Types::INTEGER, [
			'notnull' => true
		]);
		$table->addColumn('increment', Types::INTEGER, [
			'notnull' => true
		]);
		$table->addColumn('preparation_duration', Types::INTEGER, [
			'notnull' => true,
			'default' => 0
		]);
		$table->addColumn('followup_duration', Types::INTEGER, [
			'notnull' => true,
			'default' => 0
		]);
		// Minimum time before next appointment slot can be booked
		$table->addColumn('time_before_next_slot', Types::INTEGER, [
			'notnull' => false
		]);
		//Maximum slots per day - if 0, fit as many as possible
		$table->addColumn('daily_max', Types::INTEGER, [
			'notnull' => false,
			'default' => null
		]);

		$table->setPrimaryKey(['id']);
		$table->addUniqueIndex(['token'], 'cal_appt_token_uniq_idx');

		return $schema;
	}
}

<?php

declare(strict_types=1);

namespace OCA\Calendar\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\DB\Types;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

/**
 * Auto-generated migration step: Please modify to your needs!
 */
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
		$table->addColumn('id', Types::BIGINT, [
			'autoincrement' => true,
			'notnull' => true,
			'length' => 11,
			'unsigned' => true
		]);
		$table->addColumn('appt_config_id', Types::BIGINT, [
			'notnull' => true,
			'length' => 11,
			'unsigned' => true
		]);
		$table->addColumn('created_at', Types::INTEGER, [
			'notnull' => true,
			'length' => 4
		]);
		$table->addColumn('token', Types::STRING, [
			'notnull' => true,
			'length' => 32
		]);
		$table->addColumn('name', Types::STRING, [
			'notnull' => true,
			'length' => 128
		]);
		$table->addColumn('description', Types::TEXT, [
			'notnull' => false,
			'length' => null
		]);
		$table->addColumn('email', 'string', [
			'notnull' => true,
			'length' => 64
		]);
		$table->addColumn('start', Types::INTEGER, [
			'notnull' => true,
			'length' => 4
		]);
		$table->addColumn('end', Types::INTEGER, [
			'notnull' => true,
			'length' => 4
		]);
		$table->addColumn('timezone', Types::STRING, [
			'notnull' => true,
			'length' => 32
		]);

		$table->setPrimaryKey(['id']);
		$table->addUniqueIndex(['token'], 'cal_appt_bk_token_uniq_idx');

		return $schema;
	}
}

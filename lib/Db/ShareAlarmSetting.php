<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\Entity;
use OCP\DB\Types;

/**
 * @method int getCalendarId()
 * @method void setCalendarId(int $calendarId)
 * @method string getPrincipalUri()
 * @method void setPrincipalUri(string $principalUri)
 * @method bool getSuppressAlarms()
 * @method void setSuppressAlarms(bool $suppressAlarms)
 */
class ShareAlarmSetting extends Entity {
	/** @var int */
	protected $calendarId;

	/** @var string */
	protected $principalUri;

	/** @var bool */
	protected $suppressAlarms = false;

	public function __construct() {
		$this->addType('calendarId', Types::INTEGER);
		$this->addType('suppressAlarms', Types::BOOLEAN);
	}
}

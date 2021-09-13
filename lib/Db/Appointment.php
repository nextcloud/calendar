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

namespace OCA\Calendar\Db;

use JsonSerializable;
use OCP\AppFramework\Db\Entity;

/**
 * @method string getId()
 * @method void setId(int $id)
 * @method string getName()
 * @method void setName(string $name)
 * @method string getDescription()
 * @method void setDescription(string $name)
 * @method string getLocation()
 * @method void setLocation(string $name)
 * @method string getVisibility()
 * @method string getUserId()
 * @method void setUserId(string $userId)
 * @method string getCalendarUri()
 * @method void setCalendarUri(string $calendarUri)
 * @method string[] getCalendarFreebusyUris()
 * @method void setCalendarFreebusyUris(array $freebusyUris)
 * @method string getAvailability()
 * @method int getLength()
 * @method void setLength(int $length)
 * @method int getIncrement()
 * @method void setIncrement(int $increment)
 * @method int|null getPreparationDuration()
 * @method void setPreparationDuration(?int $prepDuration)
 * @method int|null getFollowupDuration()
 * @method void setFollowupDuration(?int $followup)
 * @method int|null getBuffer()
 * @method void setBuffer(?int $buffer)
 * @method int|null getDailyMax()
 * @method void setDailyMax(?int $max)
 */
class Appointment extends Entity implements JsonSerializable {

	/** @var string */
	private $name = '';

	/** @var string|null */
	private $description;

	/** @var string|null */
	private $location;

	/** @var string */
	private $visibility;

	/** @var string */
	private $userId;

	/** @var string */
	private $calendar_uri;

	/** @var string[] */
	private $calendarFreebusyUris;

	/** @var string */
	private $availability;

	/** @var int */
	private $length;

	/** @var int */
	private $increment;

	/** @var int|null */
	private $preparationDuration;

	/** @var int|null */
	private $followupDuration;

	/** @var int|null */
	private $buffer;

	/** @var int|null */
	private $dailyMax;

	/** @var string */
	public const VISIBILITY_PUBLIC = 'PUBLIC';

	/** @var string */
	public const VISIBILITY_PRIVATE = 'PRIVATE';

	/**
	 * Set the visibility
	 * Create a private appointment calendar as default
	 *
	 * @return void
	 */
	public function setVisibility(string $visibility = self::VISIBILITY_PRIVATE): void {
		if ($visibility !== self::VISIBILITY_PUBLIC) {
			$visibility = self::VISIBILITY_PRIVATE;
		}
		$this->visibility = $visibility;
	}

	public function jsonSerialize() {
		// TODO: Implement jsonSerialize() method.
	}
}

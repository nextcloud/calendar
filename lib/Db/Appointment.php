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
	protected $name = '';

	/** @var string|null */
	protected $description;

	/** @var string|null */
	protected $location;

	/** @var string */
	protected $visibility;

	/** @var string */
	protected $userId;

	/** @var string */
	protected $calendar_uri;

	/** @var string[] */
	protected $calendarFreebusyUris;

	/** @var string */
	protected $availability;

	/** @var int */
	protected $length;

	/** @var int */
	protected $increment;

	/** @var int|null */
	protected $preparationDuration;

	/** @var int|null */
	protected $followupDuration;

	/** @var int|null */
	protected $buffer;

	/** @var int|null */
	protected $dailyMax;

	/** @var string */
	public const VISIBILITY_PUBLIC = 'PUBLIC';

	/** @var string */
	public const VISIBILITY_PRIVATE = 'PRIVATE';

	/**
	 * @return int
	 */
	public function getTotalLength(): int {
		return $this->getLength() + (int)$this->getPreparationDuration() + (int)$this->getFollowupDuration();
	}


	public function jsonSerialize() {
		return [
			'id' => $this->id,
			'name' => $this->getName(),
			'description' => $this->getDescription(),
			'location' => $this->getLocation(),
			'visibility' => $this->getVisibility(),
			'userId' => $this->getUserId(),
			'calendarUri' => $this->getCalendarUri(),
			'calendarFreeBusyUris' => $this->getCalendarFreebusyUris(),
			'availability' => $this->getAvailability(),
			'length' => $this->getLength(),
			'increment' => $this->getIncrement(),
			'preparationDuration' => $this->getPreparationDuration(),
			'followUpDuration' => $this->getFollowupDuration(),
			'totalLength' => $this->getTotalLength(),
			'buffer' => $this->getBuffer(),
			'dailyMax' => $this->getDailyMax()
		];
	}
}

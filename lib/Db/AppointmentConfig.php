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

// @TODO rename and adjust types from migration

namespace OCA\Calendar\Db;

use JsonSerializable;
use OCP\AppFramework\Db\Entity;

/**
 * @method int getId()
 * @method void setId(int $id)
 * @method string getToken()
 * @method void setToken(string $token)
 * @method string getName()
 * @method void setName(string $name)
 * @method string getDescription()
 * @method void setDescription(string $name)
 * @method string getLocation()
 * @method void setLocation(?string $name)
 * @method string getVisibility()
 * @method void setVisibility(string $visibility)
 * @method string getUserId()
 * @method void setUserId(string $userId)
 * @method string getTargetCalendarUri()
 * @method void setTargetCalendarUri(string $calendarUri)
 * @method string|null getCalendarFreebusyUris()
 * @method void setCalendarFreebusyUris(?string $freebusyUris)
 * @method string getAvailability()
 * @method void setAvailability(string $availability)
 * @method int getLength()
 * @method void setLength(int $length)
 * @method int getIncrement()
 * @method void setIncrement(int $increment)
 * @method int getPreparationDuration()
 * @method void setPreparationDuration(int $prepDuration)
 * @method int getFollowupDuration()
 * @method void setFollowupDuration(int $followup)
 * @method int getBuffer()
 * @method void setBuffer(int $buffer)
 * @method int|null getDailyMax()
 * @method void setDailyMax(?int $max)
 */
class AppointmentConfig extends Entity implements JsonSerializable {

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
	protected $targetCalendarUri;

	/** @var string|null */
	protected $calendarFreebusyUris;

	/** @var string */
	protected $availability;

	/** @var int */
	protected $length;

	/** @var int */
	protected $increment;

	/** @var int */
	protected $preparationDuration;

	/** @var int */
	protected $followupDuration;

	/** @var int */
	protected $buffer;

	/** @var int|null */
	protected $dailyMax;

	/** @var string */
	public const VISIBILITY_PUBLIC = 'PUBLIC';

	/** @var string */
	public const VISIBILITY_PRIVATE = 'PRIVATE';

	/**
	 * Total length of one slot of the appointment config
	 * in minutes
	 *
	 * @return int  Minutes of Appointment slot length
	 */
	public function getTotalLength(): int {
		return $this->getLength() + $this->getPreparationDuration() + $this->getFollowupDuration();
	}

	public function jsonSerialize() {
		return [
			'id' => $this->id,
			'name' => $this->getName(),
			'description' => $this->getDescription(),
			'location' => $this->getLocation(),
			'visibility' => $this->getVisibility(),
			'userId' => $this->getUserId(),
			'calendarUri' => $this->getTargetCalendarUri(),
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

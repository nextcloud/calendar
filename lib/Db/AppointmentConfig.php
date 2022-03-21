<?php

declare(strict_types=1);

/**
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
use ReturnTypeWillChange;
use function json_decode;
use function json_encode;

/**
 * @method int getId()
 * @method void setId(int $id)
 * @method string getToken()
 * @method void setToken(string $token)
 * @method string getName()
 * @method void setName(string $name)
 * @method string|null getDescription()
 * @method void setDescription(?string $description)
 * @method string getLocation()
 * @method void setLocation(?string $location)
 * @method string getVisibility()
 * @method void setVisibility(string $visibility)
 * @method string getUserId()
 * @method void setUserId(string $userId)
 * @method string getTargetCalendarUri()
 * @method void setTargetCalendarUri(string $targetCalendarUri)
 * @method string|null getCalendarFreebusyUris()
 * @method void setCalendarFreebusyUris(?string $freebusyUris)
 * @method string getAvailability()
 * @method void setAvailability(?string $availability)
 * @method int|null getStart()
 * @method void setStart(?int $start)
 * @method int|null getEnd()
 * @method void setEnd(?int $end)
 * @method int getLength()
 * @method void setLength(int $length)
 * @method int getIncrement()
 * @method void setIncrement(int $increment)
 * @method int getPreparationDuration()
 * @method void setPreparationDuration(int $prepDuration)
 * @method int getFollowupDuration()
 * @method void setFollowupDuration(int $followup)
 * @method int getTimeBeforeNextSlot()
 * @method void setTimeBeforeNextSlot(int $buffer)
 * @method int|null getDailyMax()
 * @method void setDailyMax(?int $max)
 * @method int|null getFutureLimit()
 * @method void setFutureLimit(?int $limit)
 */
class AppointmentConfig extends Entity implements JsonSerializable {

	/** @var string */
	protected $token;

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

	/** @var string|null */
	protected $availability;

	/** @var int|null */
	protected $start;

	/** @var int|null */
	protected $end;

	/** @var int */
	protected $length;

	/** @var int */
	protected $increment;

	/** @var int */
	protected $preparationDuration;

	/** @var int */
	protected $followupDuration;

	/** @var int */
	protected $timeBeforeNextSlot;

	/** @var int|null */
	protected $dailyMax;

	/** @var int|null */
	protected $futureLimit;

	/** @var string */
	public const VISIBILITY_PUBLIC = 'PUBLIC';

	/** @var string */
	public const VISIBILITY_PRIVATE = 'PRIVATE';

	public function __construct() {
		$this->addType('start', 'int');
		$this->addType('end', 'int');
		$this->addType('length', 'int');
		$this->addType('increment', 'int');
		$this->addType('preparationDuration', 'int');
		$this->addType('followupDuration', 'int');
		$this->addType('timeBeforeNextSlot', 'int');
		$this->addType('dailyMax', 'int');
		$this->addType('futureLimit', 'int');
	}

	/**
	 * Total length of one slot of the appointment config
	 * in minutes
	 *
	 * @return int  Minutes of Appointment slot length
	 */
	public function getTotalLength(): int {
		return $this->getLength() + $this->getPreparationDuration() + $this->getFollowupDuration();
	}

	/**
	 * Principals always have the same format
	 *
	 * @return string
	 */
	public function getPrincipalUri(): string {
		return 'principals/users/' . $this->userId;
	}

	public function getCalendarFreebusyUrisAsArray(): array {
		return json_decode($this->getCalendarFreebusyUris(), true);
	}

	/**
	 * @param string[] $uris
	 */
	public function setCalendarFreeBusyUrisAsArray(array $uris): self {
		$this->setCalendarFreebusyUris(json_encode($uris));

		return $this;
	}

	public function setAvailabilityAsArray(array $availability): self {
		$this->setAvailability(json_encode($availability));

		return $this;
	}

	#[ReturnTypeWillChange]
	public function jsonSerialize() {
		return [
			'id' => $this->id,
			'token' => $this->getToken(),
			'name' => $this->getName(),
			'description' => $this->getDescription(),
			'location' => $this->getLocation(),
			'visibility' => $this->getVisibility(),
			'userId' => $this->getUserId(),
			'targetCalendarUri' => $this->getTargetCalendarUri(),
			'calendarFreeBusyUris' => $this->getCalendarFreebusyUrisAsArray(),
			'availability' => $this->getAvailability() === null ? null : json_decode($this->getAvailability(), true),
			'start' => $this->getStart(),
			'end' => $this->getEnd(),
			'length' => $this->getLength(),
			'increment' => $this->getIncrement(),
			'preparationDuration' => $this->getPreparationDuration(),
			'followUpDuration' => $this->getFollowupDuration(),
			'totalLength' => $this->getTotalLength(),
			'timeBeforeNextSlot' => $this->getTimeBeforeNextSlot(),
			'dailyMax' => $this->getDailyMax(),
			'futureLimit' => $this->getFutureLimit()
		];
	}
}

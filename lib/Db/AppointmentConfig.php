<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
 * @method int|null getCreateTalkRoom()
 * @method void setCreateTalkRoom(bool $create)
 */
class AppointmentConfig extends Entity implements JsonSerializable {
	protected string $token;
	protected string $name = '';
	protected ?string $description;
	protected ?string $location;
	protected string $visibility;
	protected string $userId;
	protected string $targetCalendarUri;
	protected ?string $calendarFreebusyUris;
	protected ?string $availability;
	protected ?int $start;
	protected ?int $end;
	protected int $length;
	protected int $increment;
	protected int $preparationDuration;
	protected int $followupDuration;
	protected int $timeBeforeNextSlot;
	protected ?int $dailyMax;
	protected ?int $futureLimit;
	protected bool $createTalkRoom;

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
		$this->addType('createTalkRoom', 'boolean');
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

	public function getAvailabilityAsArray(): array {
		return json_decode($this->getAvailability(), true, 512, JSON_THROW_ON_ERROR);
	}

	#[ReturnTypeWillChange]
	public function jsonSerialize(): array {
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
			'followupDuration' => $this->getFollowupDuration(),
			'totalLength' => $this->getTotalLength(),
			'timeBeforeNextSlot' => $this->getTimeBeforeNextSlot(),
			'dailyMax' => $this->getDailyMax(),
			'futureLimit' => $this->getFutureLimit(),
			'createTalkRoom' => $this->getCreateTalkRoom(),
		];
	}
}

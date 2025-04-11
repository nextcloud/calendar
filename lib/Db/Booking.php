<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Db;

use JsonSerializable;
use OCP\AppFramework\Db\Entity;
use OCP\DB\Types;
use ReturnTypeWillChange;

/**
 * @method int getId()
 * @method void setId(int $id)
 * @method int getApptConfigId()
 * @method void setApptConfigId(int $apptConfigId)
 * @method int getCreatedAt()
 * @method void setCreatedAt(int $timestamp)
 * @method string getToken()
 * @method void setToken(string $token)
 * @method string getDisplayName()
 * @method void setDisplayName(string $displayName)
 * @method string|null getDescription()
 * @method void setDescription(?string $description)
 * @method string getEmail()
 * @method void setEmail(string $email)
 * @method int getStart()
 * @method void setStart(int $start)
 * @method int getEnd()
 * @method void setEnd(int $end)
 * @method string getTimezone()
 * @method void setTimezone(string $timezone)
 * @method bool isConfirmed()
 * @method void setConfirmed(bool $confirm)
 */
class Booking extends Entity implements JsonSerializable {
	/** @var int */
	protected $apptConfigId;

	/** @var int */
	protected $createdAt;

	/** @var string */
	protected $token;

	/** @var string */
	protected $displayName;

	/** @var string|null */
	protected $description;

	/** @var string */
	protected $email;

	/** @var int */
	protected $start;

	/** @var int */
	protected $end;

	/** @var string */
	protected $timezone;

	/** @var bool */
	protected $confirmed;

	/**
	 * Transient talk URL
	 *
	 * @var string|null
	 */
	private $talkUrl;

	public function __construct() {
		$this->addType('id', Types::INTEGER);
		$this->addType('apptConfigId', Types::INTEGER);
		$this->addType('createdAt', Types::INTEGER);
		$this->addType('start', Types::INTEGER);
		$this->addType('end', Types::INTEGER);
		$this->addType('confirmed', Types::BOOLEAN);
	}

	#[\Override]
	#[ReturnTypeWillChange]
	public function jsonSerialize() {
		return [
			'id' => $this->getId(),
			'created_at' => $this->getCreatedAt(),
			'apptConfigId' => $this->getApptConfigId(),
			'token' => $this->getToken(),
			'displayName' => $this->getDisplayName(),
			'description' => $this->getDescription(),
			'email' => $this->getEmail(),
			'start' => $this->getStart(),
			'end' => $this->getEnd(),
			'timezone' => $this->getTimezone(),
			'confirmed' => $this->isConfirmed(),
		];
	}

	public function getTalkUrl(): ?string {
		return $this->talkUrl;
	}

	public function setTalkUrl(string $talkUrl): void {
		$this->talkUrl = $talkUrl;
	}
}

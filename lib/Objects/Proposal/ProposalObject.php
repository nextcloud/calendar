<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Db\ProposalDetailsEntry;

class ProposalObject implements \JsonSerializable {

	private ?int $id = null;
	private ?string $uid = null;
	private ?string $uname = null;
	private ?string $uuid = null;
	private ?string $title = null;
	private ?string $description = null;
	private ?string $location = null;
	private ?int $duration = null;
	private ProposalParticipantCollection $participants;
	private ProposalDateCollection $dates;
	private ProposalVoteCollection $votes;

	public function __construct() {
		$this->participants = new ProposalParticipantCollection();
		$this->dates = new ProposalDateCollection();
		$this->votes = new ProposalVoteCollection();
	}

	#[\Override]
	public function jsonSerialize(): array {
		$data = [
			'@type' => 'MeetingProposal',
			'id' => $this->id,
			'uid' => $this->uid,
			'uname' => $this->uname,
			'uuid' => $this->uuid,
			'title' => $this->title,
			'description' => $this->description,
			'location' => $this->location,
			'duration' => $this->duration,
			'participants' => $this->participants->toJson(),
			'dates' => $this->dates->toJson(),
			'votes' => $this->votes->toJson(),
		];
		return $data;
	}

	public function fromJson(array $data): void {
		if (isset($data['@type']) && $data['@type'] !== 'MeetingProposal') {
			throw new \InvalidArgumentException('Invalid type for Proposal Object');
		}

		foreach ($data as $key => $value) {
			if (property_exists($this, $key)) {
				if ($key === 'participants' && is_array($value)) {
					$this->participants->fromJson($value);
				} elseif ($key === 'dates' && is_array($value)) {
					$this->dates->fromJson($value);
				} elseif ($key === 'votes' && is_array($value)) {
					$this->votes->fromJson($value);
				} else {
					$this->{$key} = $value;
				}
			}
		}
	}

	public function toStore(): ProposalDetailsEntry {
		$entry = new ProposalDetailsEntry();
		$entry->setId($this->id);
		$entry->setUid($this->uid);
		$entry->setUuid($this->uuid);
		$entry->setTitle($this->title);
		$entry->setDescription($this->description);
		$entry->setLocation($this->location);
		$entry->setDuration($this->duration);
		return $entry;
	}

	public function fromStore(ProposalDetailsEntry $entry): void {
		$this->id = $entry->getId();
		$this->uid = $entry->getUid();
		$this->uuid = $entry->getUuid();
		$this->title = $entry->getTitle();
		$this->description = $entry->getDescription();
		$this->location = $entry->getLocation();
		$this->duration = $entry->getDuration();
	}

	public function getId(): ?int {
		return $this->id;
	}

	public function setId(?int $value): void {
		$this->id = $value;
	}

	public function getUid(): ?string {
		return $this->uid;
	}

	public function setUid(?string $value): void {
		$this->uid = $value;
	}

	public function getUname(): ?string {
		return $this->uname;
	}

	public function setUname(?string $value): void {
		$this->uname = $value;
	}

	public function getUuid(): ?string {
		return $this->uuid;
	}

	public function setUuid(?string $value): void {
		$this->uuid = $value;
	}

	public function getTitle(): ?string {
		return $this->title;
	}

	public function setTitle(?string $value): void {
		$this->title = $value;
	}

	public function getDescription(): ?string {
		return $this->description;
	}

	public function setDescription(?string $value): void {
		$this->description = $value;
	}

	public function getLocation(): ?string {
		return $this->location;
	}

	public function setLocation(?string $value): void {
		$this->location = $value;
	}

	public function getDuration(): ?int {
		return $this->duration;
	}

	public function setDuration(?int $value): void {
		$this->duration = $value;
	}

	public function getParticipants(): ProposalParticipantCollection {
		return $this->participants;
	}

	public function setParticipants(ProposalParticipantCollection $value): void {
		$this->participants = $value;
	}

	public function getDates(): ProposalDateCollection {
		return $this->dates;
	}

	public function setDates(ProposalDateCollection $value): void {
		$this->dates = $value;
	}

	public function getVotes(): ProposalVoteCollection {
		return $this->votes;
	}

	public function setVotes(ProposalVoteCollection $value): void {
		$this->votes = $value;
	}

}

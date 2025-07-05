<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use DateTimeImmutable;
use OCA\Calendar\Db\ProposalDateEntry;

class ProposalDateObject {

	private ?int $id = null;
	private DateTimeImmutable $date;
	private int $votedYes = 0;
	private int $votedNo = 0;
	private int $VotedMaybe = 0;
	
	public function toJson(): array {
		$data = [
			'@type' => 'MeetingProposalDate',
			'id' => $this->id,
			'date' => $this->date->format(DateTimeImmutable::ATOM),
			'votedYes' => $this->votedYes,
			'votedNo' => $this->votedNo,
			'votedMaybe' => $this->VotedMaybe,
		];
		return $data;
	}

	public function fromJson(array $data): void {
		foreach ($data as $key => $value) {
			if (property_exists($this, $key)) {
				if ($key === 'date' && is_string($value)) {
					$this->date = new DateTimeImmutable($value);
				} else {
					$this->{$key} = $value;
				}
			}
		}
	}

	public function toStore(): ProposalDateEntry {
		$entry = new ProposalDateEntry();
		$entry->setId($this->id);
		$entry->setDate($this->date->getTimestamp());
		$entry->setVotedYes($this->votedYes);
		$entry->setVotedNo($this->votedNo);
		$entry->setVotedMaybe($this->VotedMaybe);
		return $entry;
	}

	public function fromStore(ProposalDateEntry $entry): void {
		$this->id = $entry->getId();
		$this->date = new DateTimeImmutable("@{$entry->getDate()}");
		$this->votedYes = $entry->getVotedYes();
		$this->votedNo = $entry->getVotedNo();
		$this->VotedMaybe = $entry->getVotedMaybe();
	}

	public function getId(): ?int {
		return $this->id;
	}

	public function setId(?int $value): void {
		$this->id = $value;
	}

	public function getDate(): DateTimeImmutable {
		return $this->date;
	}

	public function setDate(DateTimeImmutable $value): void {
		$this->date = $value;
	}

	public function getVotedYes(): int {
		return $this->votedYes;
	}

	public function setVotedYes(int $value): void {
		$this->votedYes = $value;
	}

	public function getVotedNo(): int {
		return $this->votedNo;
	}

	public function setVotedNo(int $value): void {
		$this->votedNo = $value;
	}

	public function getVotedMaybe(): int {
		return $this->VotedMaybe;
	}

	public function setVotedMaybe(int $value): void {
		$this->VotedMaybe = $value;
	}
}

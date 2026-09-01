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

	public function toJson(): array {
		$data = [
			'@type' => 'MeetingProposalDate',
			'id' => $this->id,
			'date' => $this->date->format(DateTimeImmutable::ATOM),
		];
		return $data;
	}

	public function fromJson(array $data): void {
		if (isset($data['@type']) && $data['@type'] !== 'MeetingProposalDate') {
			throw new \InvalidArgumentException('Invalid type for Proposal Date Object');
		}

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
		return $entry;
	}

	public function fromStore(ProposalDateEntry $entry): void {
		$this->id = $entry->getId();
		$this->date = new DateTimeImmutable("@{$entry->getDate()}");
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

}

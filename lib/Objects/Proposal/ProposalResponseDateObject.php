<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use DateTimeImmutable;

class ProposalResponseDateObject {

	private int $id;
	private DateTimeImmutable $date;
	private string $vote;

	public function fromJson(array $data): void {
		if (isset($data['@type']) && $data['@type'] !== 'MeetingProposalResponseDate') {
			throw new \InvalidArgumentException('Invalid type for Proposal Response Date Object');
		}

		foreach ($data as $key => $value) {
			if (property_exists($this, $key)) {
				// validate values
				if ($key === 'id' && !is_int($value)) {
					throw new \InvalidArgumentException('Invalid value for id, expected integer');
				} elseif ($key === 'vote' && ProposalDateVote::tryFrom($value) === null) {
					throw new \InvalidArgumentException('Invalid value for vote, expected one of: ' . implode(', ', array_column(ProposalDateVote::cases(), 'value')));
				} elseif ($key === 'date' && !is_string($value)) {
					throw new \InvalidArgumentException('Invalid value for date, expected ISO 8601 string');
				}
				// assign values
				if ($key === 'date') {
					try {
						$this->date = new DateTimeImmutable($value);
					} catch (\Exception) {
						throw new \InvalidArgumentException('Invalid value for date, expected ISO 8601 string');
					}
				} else {
					$this->{$key} = $value;
				}
			}
		}
	}

	public function getId(): int {
		return $this->id;
	}

	public function setId(int $value): void {
		$this->id = $value;
	}

	public function getDate(): DateTimeImmutable {
		return $this->date;
	}

	public function setDate(DateTimeImmutable $value): void {
		$this->date = $value;
	}

	public function getVote(): string {
		return $this->vote;
	}

	public function setVote(string $value): void {
		$this->vote = $value;
	}

}

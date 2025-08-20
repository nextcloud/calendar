<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Db\ProposalVoteEntry;

class ProposalVoteObject {

	private ?int $id = null;
	private ?int $participantId = null;
	private ?int $dateId = null;
	private ProposalDateVote $vote;

	public function __construct() {
		$this->vote = ProposalDateVote::Maybe;
	}

	public function toJson(): array {
		$data = [
			'@type' => 'MeetingProposalVote',
			'id' => $this->id,
			'participant' => $this->participantId,
			'date' => $this->dateId,
			'vote' => $this->vote->value,
		];
		return $data;
	}

	public function fromJson(array $data): void {
		if (isset($data['@type']) && $data['@type'] !== 'MeetingProposalVote') {
			throw new \InvalidArgumentException('Invalid type for Proposal Vote Object');
		}

		foreach ($data as $key => $value) {
			if (property_exists($this, $key)) {
				if ($key === 'vote') {
					$this->vote = ProposalDateVote::from($value);
				} else {
					$this->{$key} = $value;
				}
			}
		}
	}

	public function toStore(): ProposalVoteEntry {
		$entry = new ProposalVoteEntry();
		$entry->setId($this->id);
		$entry->setParticipantId($this->participantId);
		$entry->setDateId($this->dateId);
		$entry->setVote($this->vote->value);
		return $entry;
	}

	public function fromStore(ProposalVoteEntry $entry): void {
		$this->id = $entry->getId();
		$this->participantId = $entry->getParticipantId();
		$this->dateId = $entry->getDateId();
		$this->vote = $entry->getVote() ? ProposalDateVote::from($entry->getVote()) : ProposalDateVote::Maybe;
	}

	public function getId(): ?int {
		return $this->id;
	}

	public function setId(?int $value): void {
		$this->id = $value;
	}

	public function getParticipantId(): ?int {
		return $this->participantId;
	}

	public function setParticipantId(?int $value): void {
		$this->participantId = $value;
	}

	public function getDateId(): ?int {
		return $this->dateId;
	}

	public function setDateId(?int $value): void {
		$this->dateId = $value;
	}

	public function getVote(): ProposalDateVote {
		return $this->vote;
	}

	public function setVote(ProposalDateVote $value): void {
		$this->vote = $value;
	}

}

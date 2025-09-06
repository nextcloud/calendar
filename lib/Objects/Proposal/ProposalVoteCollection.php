<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

/**
 * @extends BaseCollection<ProposalVoteObject>
 */
class ProposalVoteCollection extends BaseCollection {

	public function __construct($data = []) {
		parent::__construct(ProposalVoteObject::class, $data);
	}

	public function toJson(): array {
		$data = [];
		foreach ($this as $key => $value) {
			$data[$key] = $value->toJson();
		}
		return $data;
	}

	public function fromJson(array $votes): self {
		foreach ($votes as $entry) {
			$vote = new ProposalVoteObject();
			$vote->fromJson($entry);
			$this->append($vote);
		}
		return $this;
	}

	public function toStore(): array {
		$data = [];
		foreach ($this as $vote) {
			$data[] = $vote->toStore();
		}
		return $data;
	}

	public function fromStore(array $data): void {
		foreach ($data as $entry) {
			$vote = new ProposalVoteObject();
			$vote->fromStore($entry);
			$this->append($vote);
		}
	}

	public function findByDateAndParticipant(?int $dateId, ?int $participantId): ?ProposalVoteObject {
		foreach ($this as $vote) {
			if ($vote->getDateId() === $dateId && $vote->getParticipantId() === $participantId) {
				return $vote;
			}
		}
		return null;
	}

}

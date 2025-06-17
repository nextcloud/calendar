<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

/**
 * @extends BaseCollection<ProposalParticipantObject>
 */
class ProposalParticipantCollection extends BaseCollection {

	public function __construct($data = []) {
		parent::__construct(ProposalParticipantObject::class, $data);
	}

	public function toJson(): array {
		$data = [];
		foreach ($this as $key => $value) {
			$data[$key] = $value->toJson();
		}
		return $data;
	}

	public function fromJson(array $participants): self {
		foreach ($participants as $entry) {
			$participant = new ProposalParticipantObject();
			$participant->fromJson($entry);
			$this->append($participant);
		}
		return $this;
	}

	public function toStore(): array {
		$data = [];
		foreach ($this as $participant) {
			$data[] = $participant->toStore();
		}
		return $data;
	}

	public function fromStore(array $data): void {
		foreach ($data as $entry) {
			$participant = new ProposalParticipantObject();
			$participant->fromStore($entry);
			$this->append($participant);
		}
	}

	public function filterByRealm(ProposalParticipantRealm $realm): self {
		$filtered = new self();
		foreach ($this as $participant) {
			if ($participant->getRealm() === $realm) {
				$filtered->append($participant);
			}
		}
		return $filtered;
	}

	public function compare(ProposalParticipantCollection $diverse): array {
		// Use id if available, otherwise address as unique key
		$participantKey = function ($participant) {
			return $participant->getId() !== null ? 'id:' . $participant->getId() : 'address:' . $participant->getAddress();
		};

		$currentParticipants = [];
		foreach ($this as $participant) {
			$currentParticipants[$participantKey($participant)] = $participant;
		}

		$diverseParticipants = [];
		foreach ($diverse as $participant) {
			$diverseParticipants[$participantKey($participant)] = $participant;
		}

		$added = [];
		$modified = [];

		// Find added and modified
		foreach ($diverseParticipants as $key => $participant) {
			if (isset($currentParticipants[$key])) {
				if ($participant->getAddress() !== $currentParticipants[$key]->getAddress()) {
					$modified[] = $currentParticipants[$key];
				}
				unset($currentParticipants[$key]);
			} else {
				$added[] = $participant;
			}
		}

		return [
			'added' => $added,
			'modified' => $modified,
			'deleted' => array_values($currentParticipants)
		];
	}

}

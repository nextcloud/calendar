<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

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

}

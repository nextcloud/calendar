<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Db\ProposalParticipantEntry;

class ProposalParticipantObject {

	private ?int $id = null;
	private ?string $name = null;
	private ?string $address = null;
	private ?string $token = null;
	private ProposalParticipantStatus $status;
	private ProposalParticipantRealm $realm;

	public function toJson(): array {
		$data = [
			'@type' => 'MeetingProposalParticipant',
			'id' => $this->id,
			'name' => $this->name,
			'address' => $this->address,
			'status' => $this->status->value,
			'realm' => $this->realm->value,
			'token' => $this->token,
		];
		return $data;
	}

	public function fromJson(array $data): self {
		foreach ($data as $key => $value) {
			if (property_exists($this, $key)) {
				if ($key === 'status' && is_string($value)) {
					$this->status = ProposalParticipantStatus::from($value);
				} elseif ($key === 'realm' && is_string($value)) {
					$this->realm = ProposalParticipantRealm::from($value);
				} else {
					$this->{$key} = $value;
				}
			}
		}
		return $this;
	}

	public function toStore(): ProposalParticipantEntry {
		$entry = new ProposalParticipantEntry();
		$entry->setId($this->id);
		$entry->setName($this->name);
		$entry->setAddress($this->address);
		$entry->setStatus($this->status->value);
		$entry->setRealm($this->realm->value);
		$entry->setToken($this->token);
		return $entry;
	}

	public function fromStore(ProposalParticipantEntry $entry): void {
		$this->id = $entry->getId();
		$this->name = $entry->getName();
		$this->address = $entry->getAddress();
		$this->status = ProposalParticipantStatus::from($entry->getStatus());
		$this->realm = ProposalParticipantRealm::from($entry->getRealm());
		$this->token = $entry->getToken();
	}

	public function getId(): ?int {
		return $this->id;
	}

	public function setId(?int $value): void {
		$this->id = $value;
	}

	public function getName(): ?string {
		return $this->name;
	}

	public function setName(string $value): void {
		$this->name = $value;
	}

	public function getAddress(): ?string {
		return $this->address;
	}

	public function setAddress(string $value): void {
		$this->address = $value;
	}

	public function getStatus(): ProposalParticipantStatus {
		return $this->status;
	}

	public function setStatus(ProposalParticipantStatus $value): void {
		$this->status = $value;
	}

	public function getRealm(): ProposalParticipantRealm {
		return $this->realm;
	}

	public function setRealm(ProposalParticipantRealm $value): void {
		$this->realm = $value;
	}

	public function getToken(): ?string {
		return $this->token;
	}

	public function setToken(string $value): void {
		$this->token = $value;
	}

}

<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

class ProposalResponseObject {

	private string $token;
	private ProposalResponseDateCollection $dates;

	public function fromJson(array $data): void {
		if (isset($data['@type']) && $data['@type'] !== 'MeetingProposalResponse') {
			throw new \InvalidArgumentException('Invalid type for Proposal Response Object');
		}

		foreach ($data as $key => $value) {
			if (property_exists($this, $key)) {
				if ($key === 'dates' && is_array($value)) {
					$this->dates = new ProposalResponseDateCollection();
					$this->dates->fromJson($value);
				} else {
					$this->{$key} = $value;
				}
			}
		}
	}

	public function getToken(): string {
		return $this->token;
	}

	public function setToken(string $value): void {
		$this->token = $value;
	}

	public function getDates(): ProposalResponseDateCollection {
		return $this->dates;
	}

	public function setDates(ProposalResponseDateCollection $value): void {
		$this->dates = $value;
	}

}

<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

class ProposalDateCollection extends BaseCollection {

	public function __construct($data = []) {
		parent::__construct(ProposalDateObject::class, $data);
	}

	public function toJson(): array {
		$data = [];
		foreach ($this as $key => $value) {
			$data[$key] = $value->toJson();
		}
		return $data;
	}

	public function fromJson(array $data): void {
		foreach ($data as $entry) {
			$date = new ProposalDateObject();
			$date->fromJson($entry);
			$this->append($date);
		}
	}

	public function toStore(): array {
		$data = [];
		foreach ($this as $date) {
			$data[] = $date->toStore();
		}
		return $data;
	}

	public function fromStore(array $data): void {
		foreach ($data as $entry) {
			$date = new ProposalDateObject();
			$date->fromStore($entry);
			$this->append($date);
		}
	}
	
}

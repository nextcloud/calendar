<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

/**
 * @extends BaseCollection<ProposalDateObject>
 */
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

	public function sortByDate(): self {
		$array = $this->getArrayCopy();
		usort($array, function ($a, $b) {
			return $a->getDate() <=> $b->getDate();
		});
		$this->exchangeArray($array);
		return $this;
	}

	public function compare(ProposalDateCollection $other): array {
		// Use id if available, otherwise date timestamp as unique key
		$dateKey = function ($date) {
			return $date->getId() !== null ? 'id:' . $date->getId() : 'date:' . $date->getDate()->getTimestamp();
		};

		$currentDates = [];
		foreach ($this as $date) {
			$currentDates[$dateKey($date)] = $date;
		}

		$otherDates = [];
		foreach ($other as $date) {
			$otherDates[$dateKey($date)] = $date;
		}

		$added = [];
		$modified = [];

		// Find added and modified
		foreach ($otherDates as $key => $date) {
			if (isset($currentDates[$key])) {
				if ($date->getDate()->getTimestamp() !== $currentDates[$key]->getDate()->getTimestamp()) {
					$modified[] = $currentDates[$key];
				}
				unset($currentDates[$key]);
			} else {
				$added[] = $date;
			}
		}

		return [
			'added' => $added,
			'modified' => $modified,
			'deleted' => array_values($currentDates)
		];
	}

	public function findById(?int $id): ?ProposalDateObject {
		foreach ($this as $date) {
			if ($date->getId() === $id) {
				return $date;
			}
		}
		return null;
	}

}

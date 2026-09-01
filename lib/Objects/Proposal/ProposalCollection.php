<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

/**
 * @extends BaseCollection<ProposalObject>
 */
class ProposalCollection extends BaseCollection {

	public function __construct($data = []) {
		parent::__construct(ProposalObject::class, $data);
	}

	public function toJson(string $context): array {
		$data = [];
		foreach ($this as $value) {
			$data[] = $value->toJson($context);
		}
		return $data;
	}
}

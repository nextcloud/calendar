<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use OCA\Calendar\Objects\BaseCollection;

/**
 * @extends BaseCollection<ProposalResponseDateObject>
 */
class ProposalResponseDateCollection extends BaseCollection {

	public function __construct($data = []) {
		parent::__construct(ProposalResponseDateObject::class, $data);
	}

	public function fromJson(array $participants): self {
		foreach ($participants as $entry) {
			$participant = new ProposalResponseDateObject();
			$participant->fromJson($entry);
			$this->append($participant);
		}
		return $this;
	}

}

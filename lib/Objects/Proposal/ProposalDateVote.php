<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

enum ProposalDateVote: string {
	case Yes = 'Y';
	case No = 'N';
	case Maybe = 'M';
}

<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\Entity;

/**
 * @method int getId()
 * @method void setId(int $value)
 * @method ?string getUid()
 * @method void setUid(string $value)
 * @method ?int getPid()
 * @method void setPid(int $value)
 * @method ?int getParticipantId()
 * @method void setParticipantId(int $value)
 * @method ?int getDateId()
 * @method void setDateId(int $value)
 * @method ?string getVote()
 * @method void setVote(string $value)
 */
class ProposalVoteEntry extends Entity {
	protected ?string $uid = null;
	protected ?int $pid = null;
	protected ?int $participantId = null;
	protected ?int $dateId = null;
	protected ?string $vote = null;
}

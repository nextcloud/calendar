<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
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
 * @method ?int getDate()
 * @method void setDate(int $value)
 */
class ProposalDateEntry extends Entity {
	protected ?string $uid = null;
	protected ?int $pid = null;
	protected ?int $date = null;
}

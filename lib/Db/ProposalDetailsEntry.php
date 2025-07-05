<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\Entity;

/**
 * @method ?int getId()
 * @method void setId(int $value)
 * @method ?string getUid()
 * @method void setUid(string $value)
 * @method ?string getUuid()
 * @method void setUuid(string $value)
 * @method ?string getTitle()
 * @method void setTitle(?string $value)
 * @method ?string getDescription()
 * @method void setDescription(?string $value)
 * @method ?string getLocation()
 * @method void setLocation(?string $value)
 * @method int getDuration()
 * @method void setDuration(int $value)
 */
class ProposalDetailsEntry extends Entity {
	protected ?string $uid = null;
	protected ?string $uuid = null;
	protected ?string $title = null;
	protected ?string $description = null;
	protected ?string $location = null;
	protected int $duration = 0;
}

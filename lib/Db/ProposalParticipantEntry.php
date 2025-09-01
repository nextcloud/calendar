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
 * @method ?string getName()
 * @method void setName(string $value)
 * @method ?string getAddress()
 * @method void setAddress(string $value)
 * @method ?string getAttendance()
 * @method void setAttendance(string $value)
 * @method ?string getStatus()
 * @method void setStatus(string $value)
 * @method ?string getRealm()
 * @method void setRealm(string $value)
 * @method ?string getToken()
 * @method void setToken(string $value)
 */
class ProposalParticipantEntry extends Entity {
	protected ?string $uid = null;
	protected ?int $pid = null;
	protected ?string $name = null;
	protected ?string $address = null;
	protected ?string $attendance = null;
	protected ?string $status = null;
	protected ?string $realm = null;
	protected ?string $token = null;
}

<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Db;

use JsonSerializable;
use OCP\AppFramework\Db\Entity;
use Safe\DateTimeImmutable;

/**
 * @method int getId()
 * @method void setId(int $id)
 * @method int getApptConfigId()
 * @method void setApptConfigId(int $apptConfigId)
 * @method int getCreatedAt()
 * @method void setCreatedAt(int $timestamp)
 * @method string getToken()
 * @method void setToken(string $token)
 * @method string getName()
 * @method void setName(string $name)
 * @method string|null getDescription()
 * @method void setDescription(?string $description)
 * @method string getEmail()
 * @method void setEmail(string $email)
 * @method int|null getStart()
 * @method void setStart(int $start)
 * @method int|null getEnd()
 * @method void setEnd(int $end)
 * @method string getTimezone()
 * @method void setTimezone(string $timezone)
 */
class Booking extends Entity implements JsonSerializable {

	/** @var int */
	protected $apptConfigId;

	/** @var int */
	protected $createdAt;

	/** @var string */
	protected $token;

	/** @var string */
	protected $name = '';

	/** @var string|null */
	protected $description;

	/** @var string */
	protected $email;

	/** @var int */
	protected $start;

	/** @var int */
	protected $end;

	/** @var string */
	protected $timezone;

	public function jsonSerialize() {
		return [
			'id' => $this->getId(),
			'created_at' => $this->getCreatedAt(),
			'apptConfigId' => $this->getApptConfigId(),
			'token' => $this->getToken(),
			'name' => $this->getName(),
			'description' => $this->getDescription(),
			'email' => $this->getEmail(),
			'start' => $this->getStart(),
			'end' => $this->getEnd(),
			'timezone' => $this->getTimezone()
		];
	}
}

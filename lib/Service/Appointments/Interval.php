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

namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use JsonSerializable;

/**
 * @psalm-immutable
 */
class Interval implements JsonSerializable {
	/** @var int */
	private $start;

	/** @var int */
	private $end;

	public function __construct(int $start, int $end) {
		$this->start = $start;
		$this->end = $end;
	}

	public function getStart(): int {
		return $this->start;
	}

	public function getEnd(): int {
		return $this->end;
	}

	public function getStartAsObject(): DateTimeImmutable {
		return (new DateTimeImmutable())->setTimestamp($this->start);
	}

	public function getEndAsObject(): DateTimeImmutable {
		return (new DateTimeImmutable())->setTimestamp($this->end);
	}

	public function jsonSerialize(): array {
		return [
			'start' => $this->start,
			'end' => $this->end,
		];
	}
}

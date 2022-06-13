<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use JsonSerializable;

/**
 * @psalm-immutable
 */
class Interval implements JsonSerializable {
	public function __construct(private int $start,
		private int $end) {
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

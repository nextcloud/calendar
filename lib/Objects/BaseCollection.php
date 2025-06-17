<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects;

/**
 * @template T
 * @extends \ArrayObject<int, T>
 */
class BaseCollection extends \ArrayObject {

	private $type;

	/**
	 * @param class-string<T>|string $type
	 * @param array<T> $data
	 */
	public function __construct($type, $data = []) {
		// Ensure that all data entries are of the specified type
		$this->type = $type;
		foreach ($data as $value) {
			if (!$this->validate($value)) {
				throw new \InvalidArgumentException('Type error');
			}
		}
		parent::__construct($data);
	}

	/**
	 * @param T $value
	 */
	private function validate($value): bool {
		// Check if the value is of the specified type
		return match ($this->type) {
			'string' => is_string($value),
			'int' => is_int($value),
			'float' => is_float($value),
			'date' => $value instanceof \DateTimeInterface,
			default => $value instanceof $this->type
		};
	}

	/**
	 * @param T $value
	 */
	#[\Override]
	public function append($value): void {
		// ensure that the value is of the specified type before appending
		if (!$this->validate($value)) {
			throw new \InvalidArgumentException('Type error');
		}
		parent::append($value);
	}

	/**
	 * @param int|null $key
	 * @param T $value
	 */
	#[\Override]
	public function offsetSet($key, $value): void {
		// ensure that the value is of the specified type before setting
		if (!$this->validate($value)) {
			throw new \InvalidArgumentException('Type error');
		}
		parent::offsetSet($key, $value);
	}

}

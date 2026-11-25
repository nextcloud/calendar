<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Http;

use JsonSerializable;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse as Base;
use Throwable;
use function array_flip;
use function array_intersect_key;
use function array_map;
use function array_merge;
use function get_class;

/**
 * @see https://github.com/omniti-labs/jsend
 *
 * @psalm-type JsonData = null|string|int|float|bool|array|\stdClass|JsonSerializable
 * @extends Base<Http::STATUS_*, JsonData, array<string, mixed>>
 */
final class JsonResponse extends Base {

	/**
	 * @param JsonData $data
	 * @param Http::STATUS_* $statusCode
	 */
	public function __construct(mixed $data = [],
		int $statusCode = Http::STATUS_OK) {
		parent::__construct($data, $statusCode);

		$this->addHeader('x-calendar-response', 'true');
	}

	/**
	 * @param JsonData $data
	 * @param Http::STATUS_* $status
	 */
	public static function success(mixed $data = null,
		int $status = Http::STATUS_OK): self {
		return new self(
			[
				'status' => 'success',
				'data' => $data,
			],
			$status
		);
	}

	/**
	 * @param JsonData $data
	 * @param Http::STATUS_* $status
	 */
	public static function fail(mixed $data = null,
		int $status = Http::STATUS_BAD_REQUEST): self {
		return new self(
			[
				'status' => 'fail',
				'data' => $data,
			],
			$status
		);
	}

	/**
	 * @param Http::STATUS_* $status
	 */
	public static function error(string $message,
		int $status = Http::STATUS_INTERNAL_SERVER_ERROR,
		array $data = [],
		int|string $code = 0): self {
		return new self(
			[
				'status' => 'error',
				'message' => $message,
				'data' => $data,
				'code' => $code,
			],
			$status
		);
	}

	/**
	 * @param Http::STATUS_* $status
	 * @param mixed[] $data
	 */
	public static function errorFromThrowable(Throwable $error,
		int $status = Http::STATUS_INTERNAL_SERVER_ERROR,
		array $data = []): self {
		return self::error(
			$error->getMessage(),
			$status,
			array_merge(
				$data,
				self::serializeException($error)
			),
			$error->getCode()
		);
	}

	private static function serializeException(Throwable $throwable): array {
		$previous = $throwable->getPrevious();
		return [
			'type' => get_class($throwable),
			'message' => $throwable->getMessage(),
			'code' => $throwable->getCode(),
			'trace' => self::filterTrace($throwable->getTrace()),
			'previous' => $previous !== null ? self::serializeException($previous) : null,
		];
	}

	private static function filterTrace(array $original): array {
		return array_map(function (array $row) {
			return array_intersect_key($row,
				array_flip(['file', 'line', 'function', 'class']));
		}, $original);
	}
}

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
use function array_merge;

/**
 * @see https://github.com/omniti-labs/jsend
 *
 * @psalm-suppress MissingTemplateParam
 */
class JsonResponse extends Base {
	public function __construct($data = [],
		int $statusCode = Http::STATUS_OK) {
		parent::__construct($data, $statusCode);

		$this->addHeader('x-calendar-response', 'true');
	}

	/**
	 * @param array|JsonSerializable|bool|string $data
	 * @param int $status
	 *
	 * @return static
	 */
	public static function success($data = null,
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
	 * @param array|JsonSerializable|bool|string $data
	 * @param int $status
	 *
	 * @return static
	 */
	public static function fail($data = null,
		int $status = Http::STATUS_BAD_REQUEST): self {
		return new self(
			[
				'status' => 'fail',
				'data' => $data,
			],
			$status
		);
	}

	public static function error(string $message,
		int $status = Http::STATUS_INTERNAL_SERVER_ERROR,
		array $data = [],
		int $code = 0): self {
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
	 * @param mixed[] $data
	 */
	public static function errorFromThrowable(Throwable $error,
		int $status = Http::STATUS_INTERNAL_SERVER_ERROR,
		array $data = []): self {
		return self::error(
			$error->getMessage(),
			$status,
			$data,
			$error->getCode()
		);
	}
}

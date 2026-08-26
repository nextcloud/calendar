<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Exception;

use Exception;
use Throwable;

class ClientException extends Exception {

	public function __construct(
		$message = '',
		$code = 0,
		?Throwable $previous = null,
		private ?int $httpCode = null,
	) {
		parent::__construct($message, $code, $previous);
	}

	public function getHttpCode(): ?int {
		return $this->httpCode;
	}
}

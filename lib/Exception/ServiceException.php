<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Exception;

use Exception;
use Throwable;

class ServiceException extends Exception {
	/** @var int|null */
	private $httpCode;

	public function __construct($message = '',
		$code = 0,
		?Throwable $previous = null,
		?int $httpCode = null) {
		parent::__construct($message, $code, $previous);
		$this->httpCode = $httpCode;
	}

	public function getHttpCode(): ?int {
		return $this->httpCode;
	}
}

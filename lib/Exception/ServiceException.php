<?php

declare(strict_types=1);

/**
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * Calendar
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

namespace OCA\Calendar\Exception;

use Exception;
use Throwable;

class ServiceException extends Exception {
	/** @var int|null */
	private $httpCode;

	public function __construct($message = "",
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

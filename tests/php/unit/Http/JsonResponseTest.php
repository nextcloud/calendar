<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Http;

use ChristophWurst\Nextcloud\Testing\TestCase;
use InvalidArgumentException;
use OCA\Calendar\Http\JsonResponse;
use OCP\AppFramework\Http;
use RuntimeException;

class JsonResponseTest extends TestCase {
	public function testErrorFromThrowableWithoutPreviousException(): void {
		$exception = new RuntimeException('Failed', 42);

		$response = JsonResponse::errorFromThrowable($exception, Http::STATUS_BAD_REQUEST, ['context' => 'booking']);

		$this->assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$data = $response->getData();
		$this->assertSame('error', $data['status']);
		$this->assertSame('Failed', $data['message']);
		$this->assertSame(42, $data['code']);
		$this->assertSame('booking', $data['data']['context']);
		$this->assertSame(RuntimeException::class, $data['data']['type']);
		$this->assertSame('Failed', $data['data']['message']);
		$this->assertSame(42, $data['data']['code']);
		$this->assertNull($data['data']['previous']);
	}

	public function testErrorFromThrowablePreservesPreviousException(): void {
		$previous = new InvalidArgumentException('Invalid booking', 7);
		$exception = new RuntimeException('Failed', 42, $previous);

		$response = JsonResponse::errorFromThrowable($exception);

		$this->assertSame(Http::STATUS_INTERNAL_SERVER_ERROR, $response->getStatus());
		$data = $response->getData()['data'];
		$this->assertSame(RuntimeException::class, $data['type']);
		$this->assertSame(InvalidArgumentException::class, $data['previous']['type']);
		$this->assertSame('Invalid booking', $data['previous']['message']);
		$this->assertSame(7, $data['previous']['code']);
		$this->assertNull($data['previous']['previous']);
	}
}

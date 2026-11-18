<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Http;

use ChristophWurst\Nextcloud\Testing\TestCase;
use InvalidArgumentException;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCP\AppFramework\Http;
use RuntimeException;

class JsonResponseTest extends TestCase {
	public function testDefaultResponses(): void {
		$success = JsonResponse::success();
		$failure = JsonResponse::fail();
		$error = JsonResponse::error('Failed');

		$this->assertSame(Http::STATUS_OK, $success->getStatus());
		$this->assertSame(['status' => 'success', 'data' => null], $success->getData());
		$this->assertSame(Http::STATUS_BAD_REQUEST, $failure->getStatus());
		$this->assertSame(['status' => 'fail', 'data' => null], $failure->getData());
		$this->assertSame(Http::STATUS_INTERNAL_SERVER_ERROR, $error->getStatus());
		$this->assertSame(['status' => 'error', 'message' => 'Failed', 'data' => [], 'code' => 0], $error->getData());
	}

	/**
	 * @dataProvider jsonPayloads
	 */
	public function testFactoriesPreserveJsonPayloads(mixed $payload, mixed $decoded): void {
		foreach (['success', 'fail'] as $factory) {
			$response = JsonResponse::$factory($payload, Http::STATUS_ACCEPTED);

			$this->assertSame(Http::STATUS_ACCEPTED, $response->getStatus());
			$this->assertSame(['status' => $factory, 'data' => $payload], $response->getData());
			$this->assertSame(['status' => $factory, 'data' => $decoded], json_decode($response->render(), true, 512, JSON_THROW_ON_ERROR));
			$this->assertSame('true', $response->getHeaders()['x-calendar-response']);
			$this->assertSame('application/json; charset=utf-8', $response->getHeaders()['Content-Type']);
		}
	}

	public static function jsonPayloads(): array {
		return [
			'null' => [null, null],
			'string' => ['<booking>', '<booking>'],
			'integer' => [42, 42],
			'float' => [1.5, 1.5],
			'boolean' => [false, false],
			'array' => [['id' => 1], ['id' => 1]],
			'object' => [(object)['id' => 1], ['id' => 1]],
			'serializable' => [new class implements \JsonSerializable {
				public function jsonSerialize(): mixed {
					return ['id' => 1];
				}
			}, ['id' => 1]],
		];
	}

	public function testErrorPreservesCustomDataAndCode(): void {
		$response = JsonResponse::error('Failed', Http::STATUS_CONFLICT, ['context' => 'booking'], 'HY000');

		$this->assertSame(Http::STATUS_CONFLICT, $response->getStatus());
		$this->assertSame([
			'status' => 'error',
			'message' => 'Failed',
			'data' => ['context' => 'booking'],
			'code' => 'HY000',
		], $response->getData());
	}

	public function testExceptionTraceContainsOnlyLocationFields(): void {
		$exception = new RuntimeException('Failed');

		$response = JsonResponse::errorFromThrowable($exception);

		$trace = $response->getData()['data']['trace'];
		$this->assertNotEmpty($trace);
		foreach ($trace as $frame) {
			$this->assertSame([], array_diff(array_keys($frame), ['file', 'line', 'function', 'class']));
		}
	}

	/**
	 * @dataProvider httpExceptions
	 * @param class-string<ClientException|ServiceException> $exceptionClass
	 */
	public function testExceptionHttpStatusIsPreserved(string $exceptionClass): void {
		$exception = new $exceptionClass('Failed', 0, null, Http::STATUS_CONFLICT);

		$response = JsonResponse::errorFromThrowable($exception, $exception->getHttpCode() ?? Http::STATUS_INTERNAL_SERVER_ERROR);

		$this->assertSame(Http::STATUS_CONFLICT, $exception->getHttpCode());
		$this->assertSame(Http::STATUS_CONFLICT, $response->getStatus());
		$this->assertNull((new $exceptionClass())->getHttpCode());
	}

	public static function httpExceptions(): array {
		return [
			'client exception' => [ClientException::class],
			'service exception' => [ServiceException::class],
		];
	}

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

	public function testErrorFromThrowablePreservesStringCode(): void {
		$exception = new class extends \PDOException {
			public function __construct() {
				parent::__construct('Database failure');
				$this->code = 'HY000';
			}
		};

		$response = JsonResponse::errorFromThrowable($exception);

		$this->assertSame(Http::STATUS_INTERNAL_SERVER_ERROR, $response->getStatus());
		$this->assertSame('HY000', $response->getData()['code']);
		$this->assertSame('HY000', $response->getData()['data']['code']);
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

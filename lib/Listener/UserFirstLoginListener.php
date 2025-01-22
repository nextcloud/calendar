<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\ExampleEventService;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\ServerVersion;
use OCP\User\Events\UserFirstTimeLoggedInEvent;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;

/** @template-implements IEventListener<UserFirstTimeLoggedInEvent> */
class UserFirstLoginListener implements IEventListener {
	private bool $is31OrAbove;

	public function __construct(
		private readonly ExampleEventService $exampleEventService,
		private readonly LoggerInterface $logger,
		ContainerInterface $container,
	) {
		$this->is31OrAbove = self::isNextcloud31OrAbove($container);
	}

	private static function isNextcloud31OrAbove(ContainerInterface $container): bool {
		// ServerVersion was added in 31, but we don't care about older versions anyway
		try {
			/** @var ServerVersion $serverVersion */
			$serverVersion = $container->get(ServerVersion::class);
		} catch (ContainerExceptionInterface $e) {
			return false;
		}

		return $serverVersion->getMajorVersion() >= 31;
	}

	public function handle(Event $event): void {
		if (!($event instanceof UserFirstTimeLoggedInEvent)) {
			return;
		}

		// TODO: drop condition once we only support Nextcloud >= 31
		if (!$this->is31OrAbove) {
			return;
		}

		if (!$this->exampleEventService->shouldCreateExampleEvent()) {
			return;
		}

		$userId = $event->getUser()->getUID();
		try {
			$this->exampleEventService->createExampleEvent($userId);
		} catch (ServiceException $e) {
			$this->logger->error(
				"Failed to create example event for user $userId: " . $e->getMessage(),
				[
					'exception' => $e,
					'userId' => $userId,
				],
			);
		}
	}
}

<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\ExampleEventService;
use OCA\Calendar\Service\NextcloudVersionService;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\User\Events\UserFirstTimeLoggedInEvent;
use Psr\Log\LoggerInterface;

/** @template-implements IEventListener<UserFirstTimeLoggedInEvent> */
class UserFirstLoginListener implements IEventListener {
	public function __construct(
		private readonly ExampleEventService $exampleEventService,
		private readonly LoggerInterface $logger,
		private readonly NextcloudVersionService $versionService,
	) {
	}

	public function handle(Event $event): void {
		if (!($event instanceof UserFirstTimeLoggedInEvent)) {
			return;
		}

		// TODO: drop condition once we only support Nextcloud >= 31
		if (!$this->versionService->is31OrAbove()) {
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

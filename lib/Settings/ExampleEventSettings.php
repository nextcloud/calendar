<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Settings;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Service\ExampleEventService;
use OCA\Calendar\Service\NextcloudVersionService;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\Settings\ISettings;

class ExampleEventSettings implements ISettings {
	public function __construct(
		private readonly IInitialState $initialState,
		private readonly ExampleEventService $exampleEventService,
		private readonly NextcloudVersionService $versionService,
	) {
	}

	public function getForm() {
		$this->initialState->provideInitialState(
			'create_example_event',
			$this->exampleEventService->shouldCreateExampleEvent(),
		);
		$this->initialState->provideInitialState(
			'has_custom_example_event',
			$this->exampleEventService->hasCustomExampleEvent(),
		);
		return new TemplateResponse(Application::APP_ID, 'settings-admin-groupware');
	}

	public function getSection() {
		// TODO: drop condition once we only support Nextcloud >= 31
		if (!$this->versionService->is31OrAbove()) {
			return null;
		}

		return 'groupware';
	}

	public function getPriority() {
		return 60;
	}
}

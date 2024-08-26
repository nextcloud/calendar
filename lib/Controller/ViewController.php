<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use OC\App\CompareVersion;
use OCA\Calendar\Service\CalendarInitialStateService;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\FileDisplayResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Files\IAppData;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IConfig;
use OCP\IRequest;

class ViewController extends Controller {
	/** @var IConfig */
	private $config;


	/** @var IAppManager */
	private $appManager;

	/** @var CompareVersion */
	private $compareVersion;

	/** @var string */
	private $userId;

	private IAppData $appData;

	private CalendarInitialStateService $calendarInitialStateService;

	public function __construct(string $appName,
		IRequest $request,
		IConfig $config,
		?string $userId,
		IAppData $appData,
		CalendarInitialStateService $calendarInitialStateService) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userId = $userId;
		$this->appData = $appData;
		$this->calendarInitialStateService = $calendarInitialStateService;
	}

	/**
	 * Load the main calendar page
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index():TemplateResponse {

		$this->calendarInitialStateService->run();
		return new TemplateResponse($this->appName, 'main');
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * This function makes the colour dots work for mobile widgets
	 *
	 * Returns an SVG with size32x32 if the hex colour is valid
	 * or a Nextcloud blue svg if the colour is not
	 *
	 * @param string $color - url encoded HEX colour
	 * @return FileDisplayResponse
	 * @throws NotPermittedException
	 */
	public function getCalendarDotSvg(string $color = '#0082c9'): FileDisplayResponse {
		$validColor = '#0082c9';
		$color = trim(urldecode($color), '#');
		if (preg_match('/^([0-9a-f]{3}|[0-9a-f]{6})$/i', $color)) {
			$validColor = '#' . $color;
		}
		$svg = '<svg height="32" width="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="' . $validColor . '"/></svg>';
		$folderName = implode('_', [
			'calendar',
			$this->userId
		]);
		try {
			$folder = $this->appData->getFolder($folderName);
		} catch (NotFoundException $e) {
			$folder = $this->appData->newFolder($folderName);
		}
		$file = $folder->newFile($color . '.svg', $svg);
		$response = new FileDisplayResponse($file);
		// Some browsers won't render SVGs without content types (for security reasons)
		$response->addHeader('Content-Type', 'image/svg+xml');
		$response->cacheFor(24 * 3600); // 1 day
		return $response;
	}
}

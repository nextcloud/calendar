<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\IRequest;
use OCP\IUserManager;
use RuntimeException;

class AppointmentController extends Controller {
	/** @var IUserManager */
	private $userManager;

	/** @var AppointmentConfigService */
	private $configService;

	/** @var IInitialState */
	private $initialState;

	/** @var string|null */
	private $userId;

	public function __construct(IRequest $request,
		IUserManager $userManager,
		AppointmentConfigService $configService,
		IInitialState $initialState,
		?string $userId,
	) {
		parent::__construct(Application::APP_ID, $request);

		$this->userManager = $userManager;
		$this->configService = $configService;
		$this->initialState = $initialState;
		$this->userId = $userId;
	}

	/**
	 * @PublicPage
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return Response
	 */
	public function index(string $userId): Response {
		$user = $this->userManager->get($userId);
		if ($user === null) {
			return new TemplateResponse(
				Application::APP_ID,
				'appointments/404-index',
				[],
				TemplateResponse::RENDER_AS_GUEST
			);
		}

		$this->initialState->provideInitialState(
			'userInfo',
			[
				'uid' => $user->getUID(),
				'displayName' => $this->userManager->getDisplayName($userId),
			]
		);
		$this->initialState->provideInitialState(
			'appointmentConfigs',
			$this->configService->getAllAppointmentConfigurations($userId, AppointmentConfig::VISIBILITY_PUBLIC)
		);

		return new TemplateResponse(
			Application::APP_ID,
			'appointments/index',
			[],
			TemplateResponse::RENDER_AS_PUBLIC
		);
	}

	/**
	 * @PublicPage
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return Response
	 */
	public function show(string $token): Response {
		try {
			$config = $this->configService->findByToken($token);
		} catch (ClientException $e) {
			if ($e->getHttpCode() === Http::STATUS_NOT_FOUND) {
				return new TemplateResponse(
					Application::APP_ID,
					'appointments/404-booking',
					[],
					TemplateResponse::RENDER_AS_GUEST
				);
			}
		}

		$configOwner = $this->userManager->get($config->getUserId());
		if ($configOwner === null) {
			throw new ServiceException("Appointment config $token does not belong to a valid configOwner");
		}
		$this->initialState->provideInitialState(
			'userInfo',
			[
				'uid' => $configOwner->getUID(),
				'displayName' => $this->userManager->getDisplayName($configOwner->getUID()),
			]
		);
		$this->initialState->provideInitialState(
			'config',
			$config
		);

		if ($this->userId !== null) {
			$currentUser = $this->userManager->get($this->userId);
			if ($currentUser === null) {
				// This should never happen
				throw new RuntimeException('User ' . $this->userId . ' could not be found');
			}
			$this->initialState->provideInitialState(
				'visitorInfo',
				[
					'displayName' => $this->userManager->getDisplayName($this->userId),
					'email' => $currentUser->getEMailAddress(),
				]
			);
		}

		return new TemplateResponse(
			Application::APP_ID,
			'appointments/booking',
			[],
			TemplateResponse::RENDER_AS_PUBLIC
		);
	}
}

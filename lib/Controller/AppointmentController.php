<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
		?string $userId
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

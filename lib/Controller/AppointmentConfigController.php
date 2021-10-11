<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Controller;

use OC\OCS\Exception;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUser;

/**
 * Class PublicViewController
 *
 * @package OCA\Calendar\Controller
 */
class AppointmentConfigController extends Controller {

	/** @var IInitialStateService */
	private $initialStateService;

	/** @var IUser */
	private $user;

	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IInitialStateService $initialStateService
	 * @param IUser $user
	 * @param AppointmentConfigService $appointmentService
	 */
	public function __construct(string                   $appName,
								IRequest                 $request,
								IInitialStateService     $initialStateService,
								IUser                    $user,
								AppointmentConfigService $appointmentService) {
		parent::__construct($appName, $request);
		$this->initialStateService = $initialStateService;
		$this->user = $user;
		$this->appointmentConfigService = $appointmentService;
	}

	/**
	 * @param string $renderAs
	 * @return TemplateResponse
	 */
	public function index(string $renderAs
							):TemplateResponse {
		$appointmentConfigs = [];
		try {
			$appointmentConfigs =  $this->appointmentConfigService->getAllAppointmentConfigurations($this->user->getUID());
		}catch (ServiceException $e) {
			// do nothing and don't show any appointments
		}

		$this->initialStateService->provideInitialState($this->appName, 'appointmentConfigurations', $appointmentConfigs);

		return new TemplateResponse($this->appName, 'main', [
		], $renderAs);
	}

	/**
	 * @param string $name
	 * @param string $description
	 * @param string $location
	 * @param string $visibility
	 * @param string $targetCalendarUri
	 * @param string $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $buffer
	 * @param int|null $dailyMax
	 * @param string|null $freebusyUris
	 * @return JsonResponse
	 */
	public function create(
		string $name,
		string $description,
		string $location,
		string $visibility,
		string $principalUri,
		string $targetCalendarUri,
		string $availability,
	   	int $length,
		int $increment,
		int $preparationDuration = 0,
		int $followupDuration = 0,
		int $buffer = 0,
		?int $dailyMax = null,
		?string $freebusyUris = null): JsonResponse {

		$appointmentConfig = new AppointmentConfig();
		$appointmentConfig->setName($name);
		$appointmentConfig->setDescription($description);
		$appointmentConfig->setLocation($location);
		$appointmentConfig->setVisibility($visibility);
		$appointmentConfig->setUserId($this->user->getUID());
		$appointmentConfig->setPrincipalUri($principalUri);
		$appointmentConfig->setTargetCalendarUri($targetCalendarUri);
		$appointmentConfig->setAvailability($availability);
		$appointmentConfig->setLength($length);
		$appointmentConfig->setIncrement($increment);
		$appointmentConfig->setPreparationDuration($preparationDuration);
		$appointmentConfig->setFollowupDuration($followupDuration);
		$appointmentConfig->setBuffer($buffer);
		$appointmentConfig->setDailyMax($dailyMax);
		$appointmentConfig->setCalendarFreebusyUris($freebusyUris);

		try {
			$appointmentConfig = $this->appointmentConfigService->create($appointmentConfig);
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e){
			return JsonResponse::errorFromThrowable($e);
		}

	}

	/**
	 * @param int $id
	 * @return JsonResponse
	 */
	public function show(int $id): JsonResponse {
		try {
			$appointmentConfig = $this->appointmentConfigService->findByIdAndUser($id, $this->user->getUID());
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e){
			return JsonResponse::errorFromThrowable($e);
		}
	}

	/**
	 * @param int $id
	 * @param string $name
	 * @param string $description
	 * @param string $location
	 * @param string $visibility
	 * @param string $targetCalendarUri
	 * @param string $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $buffer
	 * @param int|null $dailyMax
	 * @param string|null $freebusyUris
	 * @return JsonResponse
	 */
	public function update(
		int $id,
		string $name,
		string $description,
		string $location,
		string $visibility,
		string $targetCalendarUri,
		string $availability,
		int $length,
		int $increment,
		int $preparationDuration = 0,
		int $followupDuration = 0,
		int $buffer = 0,
		?int $dailyMax = null,
		?string $freebusyUris = null): JsonResponse {

		try {
			$appointmentConfig = $this->appointmentConfigService->findByIdAndUser($id, $this->user->getUID());
		} catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e);
		}

		$appointmentConfig->setName($name);
		$appointmentConfig->setDescription($description);
		$appointmentConfig->setLocation($location);
		$appointmentConfig->setVisibility($visibility);
		$appointmentConfig->setUserId($this->user->getUID());
		$appointmentConfig->setTargetCalendarUri($targetCalendarUri);
		$appointmentConfig->setAvailability($availability);
		$appointmentConfig->setLength($length);
		$appointmentConfig->setIncrement($increment);
		$appointmentConfig->setPreparationDuration($preparationDuration);
		$appointmentConfig->setFollowupDuration($followupDuration);
		$appointmentConfig->setBuffer($buffer);
		$appointmentConfig->setDailyMax($dailyMax);
		$appointmentConfig->setCalendarFreebusyUris($freebusyUris);

		try {
			$appointmentConfig = $this->appointmentConfigService->update($appointmentConfig);
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e){
			return JsonResponse::errorFromThrowable($e, 403);
		}
	}

	/**
	 * @param int $id
	 * @return JsonResponse
	 */
	public function delete(int $id): JsonResponse {
		try {
			$this->appointmentConfigService->delete($id, $this->user->getUID());
			return JsonResponse::success();
		} catch (ServiceException $e){
			return JsonResponse::errorFromThrowable($e, 403);
		}
	}

}

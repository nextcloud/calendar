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

use OC\DatabaseException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\AppointmentsService;
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
class SlotsController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IInitialStateService
	 */
	private $initialStateService;

	/**
	 * @var IURLGenerator
	 */
	private $urlGenerator;

	/** @var IUser */
	private $user;

	/** @var AppointmentsService */
	private $appointmentsService;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IConfig $config
	 * @param IInitialStateService $initialStateService
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct(string $appName,
								IRequest $request,
								IConfig $config,
								IInitialStateService $initialStateService,
								IURLGenerator $urlGenerator,
								IUser $user,
								AppointmentsService $appointmentsService) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->initialStateService = $initialStateService;
		$this->urlGenerator = $urlGenerator;
		$this->user = $user;
		$this->appointmentsService = $appointmentsService;
	}

	/**
	 * @throws ServiceException
	 * @throws \JsonException
	 */
	public function getSlotsForTimespan(int $appointmentId, int $unixStartDate, int $unixEndDate) {
		try {
			$data = $this->appointmentsService->getSlots($appointmentId,$unixStartDate,$unixEndDate);
		}catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e);
		}
		return JsonResponse::success($data);
	}

	public function bookSlot($data) {

	}

}

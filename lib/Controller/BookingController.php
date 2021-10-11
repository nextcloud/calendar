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
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\Booking;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\IManager;
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
class BookingController extends Controller {

	/** @var BookingService */
	private $bookingService;

	/** @var ITimeFactory */
	private $timeFactory;

	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	/** @var IManager */
	private $manager;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IConfig $config
	 * @param IInitialStateService $initialStateService
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct(string                   $appName,
								IRequest                 $request,
								ITimeFactory             $timeFactory,
								BookingService           $bookingService,
								AppointmentConfigService $appointmentConfigService,
								IManager                 $manager) {
		parent::__construct($appName, $request);

		$this->bookingService = $bookingService;
		$this->timeFactory = $timeFactory;
		$this->appointmentConfigService = $appointmentConfigService;
		$this->manager = $manager;
	}

	/**
	 * @throws ServiceException
	 * @throws \JsonException
	 */
	public function getBookableSlots(int $appointmentConfigId, int $unixStartTime, int $unixEndTime) {
		// rate limit this to only allow ranges between 0 to 7 days
		if(ceil(($unixEndTime-$unixStartTime)/86400) > 7) {
			return JsonResponse::error('Date Range too large.', 403);
		}

		if($this->timeFactory->getTime() > $unixStartTime || $this->timeFactory->getTime() > $unixEndTime) {
			throw  new ServiceException('Booking time must be in the future', 403);
		}

		$appointmentConfig = $this->appointmentConfigService->findById($appointmentConfigId);
		$booking = new Booking($appointmentConfig, $unixStartTime, $unixEndTime);
		$data = $this->bookingService->getSlots($booking);
		return JsonResponse::success($data);
	}

	public function bookSlot($data) {

	}

}

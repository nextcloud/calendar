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

use DateTimeImmutable;
use DateTimeZone;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\IRequest;

class BookingController extends Controller {

	/** @var BookingService */
	private $bookingService;

	/** @var ITimeFactory */
	private $timeFactory;

	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	public function __construct(string                   $appName,
								IRequest                 $request,
								ITimeFactory             $timeFactory,
								BookingService           $bookingService,
								AppointmentConfigService $appointmentConfigService) {
		parent::__construct($appName, $request);

		$this->bookingService = $bookingService;
		$this->timeFactory = $timeFactory;
		$this->appointmentConfigService = $appointmentConfigService;
	}

	/**
	 * @NoAdminRequired
	 * @PublicPage
	 *
	 * @param int $appointmentConfigId
	 * @param int $startTime UNIX time stamp for the start time in UTC
	 * @param int $endTime UNIX time stamp for the start time in UTC
	 * @param string $timeZone
	 *
	 * @return JsonResponse
	 */
	public function getBookableSlots(int $appointmentConfigId,
									 int $startTime,
									 int $endTime,
									 string $timeZone): JsonResponse {
		// Convert the timestamps to the beginning and end of the respective day in the specified timezone
		$tz = new DateTimeZone($timeZone);
		$startTimeInTz = (new DateTimeImmutable())
			->setTimestamp($startTime)
			->setTimezone($tz)
			->setTime(0, 0)
			->getTimestamp();
		$endTimeInTz = (new DateTimeImmutable())
			->setTimestamp($endTime)
			->setTimezone($tz)
			->setTime(23, 59, 59)
			->getTimestamp();

		if ($startTimeInTz > $endTimeInTz) {
			return JsonResponse::fail('Invalid time range', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
		// rate limit this to only allow ranges between 0 to 7 days
		if (ceil(($endTimeInTz - $startTimeInTz) / 86400) > 7) {
			return JsonResponse::fail('Date Range too large.', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
		$now = $this->timeFactory->getTime();
		if ($now > $endTimeInTz) {
			return JsonResponse::fail('Slot time range must be in the future', Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$config = $this->appointmentConfigService->findById($appointmentConfigId);
		} catch (ServiceException $e) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}
		return JsonResponse::success(
			$this->bookingService->getAvailableSlots($config, $startTimeInTz, $endTimeInTz)
		);
	}

	public function bookSlot(int $appointmentConfigId,
							 int $start,
							 string $name,
							 string $email,
							 string $description): JsonResponse {
		return JsonResponse::success();

		//$this->bookingService->book($calendarData);
		return JsonResponse::success();
	}
}

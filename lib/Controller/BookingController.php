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

use DateTime;
use DateTimeImmutable;
use DateTimeZone;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\DB\Exception;
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
									 string $timeZone): JsonResponse {
		// Convert the timestamps to the beginning and end of the respective day in the specified timezone
		$tz = new DateTimeZone($timeZone);
		$startTimeInTz = (new DateTimeImmutable())
			->setTimestamp($startTime)
			->setTimezone($tz)
			->setTime(0, 0)
			->getTimestamp();
		$endTimeInTz = (new DateTimeImmutable())
			->setTimestamp($startTime)
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

	/**
	 * @NoAdminRequired
	 * @PublicPage
	 *
	 * @param int $appointmentConfigId
	 * @param int $start
	 * @param int $end
	 * @param string $displayName
	 * @param string $email
	 * @param string $description
	 * @param string $timeZone
	 * @return JsonResponse
	 */
	public function bookSlot(int    $appointmentConfigId,
							 int    $start,
							 int    $end,
							 string $displayName,
							 string $email,
							 string $description,
							 string $timeZone): JsonResponse {
		if ($start > $end) {
			return JsonResponse::fail('Invalid time range', Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$config = $this->appointmentConfigService->findById($appointmentConfigId);
		} catch (ServiceException $e) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$booking = $this->bookingService->book($config, $start, $end, $timeZone, $displayName, $email, $description);
		} catch (ClientException $e) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$this->bookingService->sendConfirmationEmail($booking, $config);
		} catch( ServiceException $e) {
			$this->bookingService->deleteEntity($booking);
			return JsonResponse::fail(null, Http::STATUS_BAD_REQUEST);
		}

		return JsonResponse::success($booking);
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 * @return JsonResponse
	 * @throws Exception
	 * @throws MultipleObjectsReturnedException
	 */
	public function confirmBooking(string $token): JsonResponse {
		try {
			$booking = $this->bookingService->findByToken($token);
		} catch(ClientException $e) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$config = $this->appointmentConfigService->findById($booking->getApptConfigId());
		} catch (ServiceException $e) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$booking = $this->bookingService->confirmBooking($booking, $config);
		} catch (ClientException $e) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		$this->bookingService->deleteEntity($booking);

		return JsonResponse::success($booking);
	}
}

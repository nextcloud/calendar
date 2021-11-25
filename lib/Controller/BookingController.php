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
use InvalidArgumentException;
use OC\URLGenerator;
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\NoSlotFoundException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\DB\Exception;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class BookingController extends Controller {

	/** @var BookingService */
	private $bookingService;

	/** @var ITimeFactory */
	private $timeFactory;

	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	/** @var IInitialState */
	private $initialState;

	/** @var URLGenerator */
	private $urlGenerator;

	/** @var LoggerInterface */
	private $logger;

	public function __construct(string                   $appName,
								IRequest                 $request,
								ITimeFactory             $timeFactory,
								IInitialState            $initialState,
								BookingService           $bookingService,
								AppointmentConfigService $appointmentConfigService,
								URLGenerator             $urlGenerator,
								LoggerInterface $logger) {
		parent::__construct($appName, $request);

		$this->bookingService = $bookingService;
		$this->timeFactory = $timeFactory;
		$this->appointmentConfigService = $appointmentConfigService;
		$this->initialState = $initialState;
		$this->urlGenerator = $urlGenerator;
		$this->logger = $logger;
	}

	/**
	 * @NoAdminRequired
	 * @PublicPage
	 *
	 * @param int $appointmentConfigId
	 * @param int $startTime UNIX time stamp for the start time in UTC
	 * @param string $timeZone
	 *
	 * @return JsonResponse
	 */
	public function getBookableSlots(int $appointmentConfigId,
									 int $startTime,
									 string $timeZone): JsonResponse {
		// Convert the timestamps to the beginning and end of the respective day in the specified timezone
		try {
			$tz = new DateTimeZone($timeZone);
		} catch (Exception $e) {
			$this->logger->error('Timezone invalid', ['exception' => $e]);
			return JsonResponse::fail('Invalid time zone', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
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
			$this->logger->warning('Invalid time range - end time ' . $endTimeInTz . ' before start time ' . $startTimeInTz);
			return JsonResponse::fail('Invalid time range', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
		// rate limit this to only allow ranges between 0 and 7 days
		if (ceil(($endTimeInTz - $startTimeInTz) / 86400) > 7) {
			$this->logger->warning('Date range too large for start ' . $startTimeInTz . ' end ' . $endTimeInTz);
			return JsonResponse::fail('Date Range too large.', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
		$now = $this->timeFactory->getTime();
		if ($now > $endTimeInTz) {
			$this->logger->warning('Slot time must be in the future - now ' . $now . ' end ' . $endTimeInTz);
			return JsonResponse::fail('Slot time range must be in the future', Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$config = $this->appointmentConfigService->findById($appointmentConfigId);
		} catch (ServiceException $e) {
			$this->logger->error('No appointment config found for id ' . $appointmentConfigId, ['exception' => $e]);
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
			$this->logger->error('No appointment config found for id ' . $appointmentConfigId, ['exception' => $e]);
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}
		try {
			$booking = $this->bookingService->book($config, $start, $end, $timeZone, $displayName, $email, $description);
		} catch (NoSlotFoundException $e) {
			$this->logger->warning('No slot available for start: ' . $start . ', end: ' . $end . ', config id: ' . $appointmentConfigId , ['exception' => $e]);
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		} catch (InvalidArgumentException $e) {
			$this->logger->warning($e->getMessage(), ['exception' => $e]);
			return JsonResponse::fail(null, Http::STATUS_UNPROCESSABLE_ENTITY);
		} catch (ServiceException|ClientException $e) {
			$this->logger->error($e->getMessage(), ['exception' => $e]);
			return JsonResponse::errorFromThrowable($e, $e->getHttpCode() ?? Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return JsonResponse::success($booking);
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 * @return TemplateResponse
	 * @throws Exception
	 */
	public function confirmBooking(string $token): TemplateResponse {
		try {
			$booking = $this->bookingService->findByToken($token);
		} catch (ClientException $e) {
			$this->logger->warning($e->getMessage(), ['exception' => $e]);
			return new TemplateResponse(
				Application::APP_ID,
				'appointments/404-booking',
				[],
				TemplateResponse::RENDER_AS_GUEST
			);
		}

		try {
			$config = $this->appointmentConfigService->findById($booking->getApptConfigId());
		} catch (ServiceException $e) {
			$this->logger->error($e->getMessage(), ['exception' => $e]);
			return new TemplateResponse(
				Application::APP_ID,
				'appointments/404-booking',
				[],
				TemplateResponse::RENDER_AS_GUEST
			);
		}

		$link = $this->urlGenerator->linkToRouteAbsolute('calendar.appointment.show', [ 'token' => $config->getToken() ]);
		try {
			$booking = $this->bookingService->confirmBooking($booking, $config);
		} catch (ClientException $e) {
			$this->logger->warning($e->getMessage(), ['exception' => $e]);
		}

		$this->initialState->provideInitialState(
			'appointment-link',
			$link
		);
		$this->initialState->provideInitialState(
			'booking',
			$booking
		);

		return new TemplateResponse(
			Application::APP_ID,
			'appointments/booking-conflict',
			[],
			TemplateResponse::RENDER_AS_GUEST
		);
	}
}

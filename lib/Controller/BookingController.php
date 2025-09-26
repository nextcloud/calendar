<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use DateTime;
use DateTimeZone;
use InvalidArgumentException;
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\NoSlotFoundException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\AnonRateLimit;
use OCP\AppFramework\Http\Attribute\UserRateLimit;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\DB\Exception;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Mail\IMailer;
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

	/** @var IURLGenerator */
	private $urlGenerator;

	/** @var LoggerInterface */
	private $logger;

	/** @var IMailer */
	private $mailer;
	private IConfig $systemConfig;

	public function __construct(string $appName,
		IRequest $request,
		ITimeFactory $timeFactory,
		IInitialState $initialState,
		BookingService $bookingService,
		AppointmentConfigService $appointmentConfigService,
		IURLGenerator $urlGenerator,
		LoggerInterface $logger,
		IMailer $mailer,
		IConfig $systemConfig) {
		parent::__construct($appName, $request);

		$this->bookingService = $bookingService;
		$this->timeFactory = $timeFactory;
		$this->appointmentConfigService = $appointmentConfigService;
		$this->initialState = $initialState;
		$this->urlGenerator = $urlGenerator;
		$this->logger = $logger;
		$this->mailer = $mailer;
		$this->systemConfig = $systemConfig;
	}

	/**
	 * @NoAdminRequired
	 * @PublicPage
	 *
	 * @param string $appointmentConfigToken
	 * @param int $startTime UNIX time stamp for the start time in UTC
	 * @param string $timeZone
	 *
	 * @return JsonResponse
	 */
	public function getBookableSlots(
		string $appointmentConfigToken,
		string $dateSelected,
		string $timeZone,
	): JsonResponse {
		try {
			$tz = new DateTimeZone($timeZone);
		} catch (Exception $e) {
			$this->logger->error('Timezone invalid', ['exception' => $e]);
			return JsonResponse::fail('Invalid time zone', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
		// Convert selected date to requesters selected timezone adjusted start and end of day in epoch
		$startTimeInTz = (new DateTime($dateSelected, $tz))
			->getTimestamp();
		$endTimeInTz = (new DateTime($dateSelected, $tz))
			->modify('+1 day')
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
			$config = $this->appointmentConfigService->findByToken($appointmentConfigToken);
		} catch (ServiceException $e) {
			$this->logger->error('No appointment config found for ' . $appointmentConfigToken, ['exception' => $e]);
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
	 * @param string $appointmentConfigToken
	 * @param int $start
	 * @param int $end
	 * @param string $displayName
	 * @param string $email
	 * @param string $description
	 * @param string $timeZone
	 * @return JsonResponse
	 *
	 * @AnonRateThrottle(limit=10, period=1200)
	 * @UserRateThrottle(limit=10, period=300)
	 */
	#[AnonRateLimit(limit: 10, period: 1200)]
	#[UserRateLimit(limit: 10, period: 300)]
	public function bookSlot(string $appointmentConfigToken,
		int $start,
		int $end,
		string $displayName,
		string $email,
		string $description,
		string $timeZone): JsonResponse {
		if (!$this->mailer->validateMailAddress($email)) {
			return JsonResponse::fail('Invalid email address', Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		if ($start > $end) {
			return JsonResponse::fail('Invalid time range', Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$config = $this->appointmentConfigService->findByToken($appointmentConfigToken);
		} catch (ServiceException $e) {
			$this->logger->error('No appointment config found for token ' . $appointmentConfigToken, ['exception' => $e]);
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}
		try {
			$booking = $this->bookingService->book($config, $start, $end, $timeZone, $displayName, $email, $description);
		} catch (NoSlotFoundException $e) {
			$this->logger->warning('No slot available for start: ' . $start . ', end: ' . $end . ', config token: ' . $appointmentConfigToken, ['exception' => $e]);
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		} catch (InvalidArgumentException $e) {
			$this->logger->warning($e->getMessage(), ['exception' => $e]);
			return JsonResponse::fail(null, Http::STATUS_UNPROCESSABLE_ENTITY);
		} catch (ServiceException $e) {
			$this->logger->error($e->getMessage(), ['exception' => $e]);

			if ($this->systemConfig->getSystemValue('debug', false)) {
				return JsonResponse::errorFromThrowable($e, $e->getHttpCode() ?? Http::STATUS_INTERNAL_SERVER_ERROR,
					['debug' => true,]
				);
			}

			return JsonResponse::error(
				'Server error',
				$e->getHttpCode() ?? Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}

		return JsonResponse::success();
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

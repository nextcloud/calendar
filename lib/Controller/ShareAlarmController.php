<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Db\ShareAlarmSetting;
use OCA\Calendar\Db\ShareAlarmSettingMapper;
use OCA\Calendar\Http\JsonResponse;
use OCA\DAV\CalDAV\CalDavBackend;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Http;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class ShareAlarmController extends Controller {

	public function __construct(
		IRequest $request,
		private readonly ShareAlarmSettingMapper $mapper,
		private readonly CalDavBackend $calDavBackend,
		private readonly LoggerInterface $logger,
		private readonly ?string $userId,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	/**
	 * Get alarm suppression settings for all shares of a calendar
	 *
	 * @NoAdminRequired
	 *
	 * @param string $calendarUrl The owner's calendar DAV URL
	 * @return JsonResponse
	 */
	public function get(string $calendarUrl): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail(null, Http::STATUS_UNAUTHORIZED);
		}

		$calendarId = $this->resolveCalendarId($calendarUrl);
		if ($calendarId === null) {
			return JsonResponse::fail('Calendar not found', Http::STATUS_NOT_FOUND);
		}

		$settings = $this->mapper->findAllByCalendarId($calendarId);
		$result = [];
		foreach ($settings as $setting) {
			$result[$setting->getPrincipalUri()] = $setting->getSuppressAlarms();
		}

		return JsonResponse::success($result);
	}

	/**
	 * Toggle alarm suppression for a specific share
	 *
	 * @NoAdminRequired
	 *
	 * @param string $calendarUrl The owner's calendar DAV URL
	 * @param string $principalUri The sharee's principal URI
	 * @param bool $suppressAlarms Whether to suppress alarms
	 * @return JsonResponse
	 */
	public function toggle(string $calendarUrl, string $principalUri, bool $suppressAlarms): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail(null, Http::STATUS_UNAUTHORIZED);
		}

		$calendarId = $this->resolveCalendarId($calendarUrl);
		if ($calendarId === null) {
			return JsonResponse::fail('Calendar not found', Http::STATUS_NOT_FOUND);
		}

		try {
			$setting = $this->mapper->findByCalendarAndPrincipal($calendarId, $principalUri);
			$setting->setSuppressAlarms($suppressAlarms);
			$this->mapper->update($setting);
		} catch (DoesNotExistException) {
			$setting = new ShareAlarmSetting();
			$setting->setCalendarId($calendarId);
			$setting->setPrincipalUri($principalUri);
			$setting->setSuppressAlarms($suppressAlarms);
			$this->mapper->insert($setting);
		} catch (\Exception $e) {
			$this->logger->error('Failed to toggle alarm suppression', [
				'exception' => $e,
				'calendarUrl' => $calendarUrl,
				'principalUri' => $principalUri,
			]);
			return JsonResponse::fail(null, Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return JsonResponse::success(['suppressAlarms' => $suppressAlarms]);
	}

	/**
	 * Resolve a calendar DAV URL to its internal integer ID
	 *
	 * Parses the URL to extract the owner and calendar URI, then looks up
	 * the calendar in the CalDAV backend. Also verifies the current user
	 * owns the calendar.
	 *
	 * @param string $calendarUrl The calendar DAV URL (e.g. /remote.php/dav/calendars/owner/calname/)
	 * @return int|null The internal calendar ID, or null if not found or not owned
	 */
	private function resolveCalendarId(string $calendarUrl): ?int {
		// Extract owner and calendar URI from the URL
		// Expected format: .../calendars/{owner}/{calendarUri}/...
		if (!preg_match('#/calendars/([^/]+)/([^/]+)#', $calendarUrl, $matches)) {
			$this->logger->warning('Could not parse calendar URL', ['calendarUrl' => $calendarUrl]);
			return null;
		}

		$ownerName = $matches[1];
		$calendarUri = $matches[2];

		// Verify the current user is the calendar owner
		if ($ownerName !== $this->userId) {
			$this->logger->warning('User attempted to modify alarm settings for a calendar they do not own', [
				'userId' => $this->userId,
				'ownerName' => $ownerName,
			]);
			return null;
		}

		$principalUri = 'principals/users/' . $ownerName;
		$calendars = $this->calDavBackend->getCalendarsForUser($principalUri);

		foreach ($calendars as $calendar) {
			if ($calendar['uri'] === $calendarUri) {
				return (int)$calendar['id'];
			}
		}

		return null;
	}
}

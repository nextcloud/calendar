<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use OCA\Calendar\Service\CalendarInitialStateService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Calendar\IManager;
use OCP\IRequest;
use OCP\IURLGenerator;

/**
 * Controller for permanent event deep links.
 *
 * Routes like /apps/calendar/event/{uid} and /apps/calendar/event/{uid}/{recurrenceId}
 * resolve the UID to the appropriate calendar object and redirect to the standard
 * edit route which the Vue SPA handles.
 */
class EventController extends Controller {

	public function __construct(
		string $appName,
		IRequest $request,
		private CalendarInitialStateService $calendarInitialStateService,
		private IManager $calendarManager,
		private IURLGenerator $urlGenerator,
		private ?string $userId,
	) {
		parent::__construct($appName, $request);
	}

	/**
	 * Resolve a permanent event deep link.
	 *
	 * Searches all calendars for an event with the given UID and redirects
	 * to the standard edit route. Falls back to serving the SPA if the
	 * event cannot be resolved server-side.
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @param string $uid The iCalendar UID of the event
	 * @param string|null $recurrenceId Unix timestamp of the recurrence instance, or null for 'next'
	 * @return Response
	 */
	public function index(string $uid, ?string $recurrenceId = null): Response {
		if ($this->userId === null) {
			// Not logged in, serve SPA which will show login prompt
			$this->calendarInitialStateService->run();
			return new TemplateResponse($this->appName, 'main');
		}

		$principalUri = 'principals/users/' . $this->userId;
		$calendars = $this->calendarManager->getCalendarsForPrincipal($principalUri);

		foreach ($calendars as $calendar) {
			if (method_exists($calendar, 'isDeleted') && $calendar->isDeleted()) {
				continue;
			}

			$results = $calendar->search('', [], ['uid' => $uid], 1);
			if (!empty($results)) {
				$result = $results[0];
				$objectUri = $result['uri'];
				$calendarUri = $calendar->getUri();

				// Construct the DAV path that matches what the frontend uses for objectId
				$davPath = '/remote.php/dav/calendars/' . $this->userId . '/' . $calendarUri . '/' . $objectUri;
				$objectId = base64_encode($davPath);

				$editRecurrenceId = $recurrenceId ?? 'next';

				return new RedirectResponse(
					$this->urlGenerator->linkToRoute('calendar.view.indexdirect.edit.recurrenceId', [
						'objectId' => $objectId,
						'recurrenceId' => $editRecurrenceId,
					])
				);
			}
		}

		// Event not found — serve the SPA anyway, which will show an error
		$this->calendarInitialStateService->run();
		return new TemplateResponse($this->appName, 'main');
	}
}

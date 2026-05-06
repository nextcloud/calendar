<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use OCA\Calendar\Service\ObjectResolverService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\FrontpageRoute;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\IRequest;
use OCP\IURLGenerator;

class ObjectController extends Controller {

	public function __construct(
		string $appName,
		IRequest $request,
		private ObjectResolverService $objectResolverService,
		private IURLGenerator $urlGenerator,
		private ?string $userId,
	) {
		parent::__construct($appName, $request);
	}

	/**
	 * Resolve a permanent calendar object deep link.
	 *
	 * @param string $uid The iCalendar UID of the object
	 * @param string|null $recurrenceId Unix timestamp of the recurrence instance, or null for 'next'
	 */
	#[NoAdminRequired]
	#[NoCSRFRequired]
	#[FrontpageRoute(verb: 'GET', url: '/object/{uid}', postfix: 'uid')]
	#[FrontpageRoute(verb: 'GET', url: '/object/{uid}/{recurrenceId}', postfix: 'uid.recurrenceId')]
	public function index(string $uid, ?string $recurrenceId = null): RedirectResponse {

		$resolved = $this->userId !== null
			? $this->objectResolverService->findByUid($this->userId, $uid)
			: null;

		if ($resolved !== null) {
			$davPath = '/remote.php/dav/calendars/' . $this->userId . '/' . $resolved['calendarUri'] . '/' . $resolved['objectUri'];
			$objectId = base64_encode($davPath);

			return new RedirectResponse(
				$this->urlGenerator->linkToRoute('calendar.view.indexdirect.edit.recurrenceId', [
					'objectId' => $objectId,
					'recurrenceId' => $recurrenceId ?? 'next',
				])
			);
		}

		// Object not found (no access or deleted) — redirect to a non-existent object so
		// the frontend error handling displays "Event does not exist" instead of a blank page.
		return new RedirectResponse(
			$this->urlGenerator->linkToRoute('calendar.view.indexdirect.edit.recurrenceId', [
				'objectId' => base64_encode("/object-not-found/$uid"),
				'recurrenceId' => $recurrenceId ?? 'next',
			])
		);
	}
}

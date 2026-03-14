<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Reference;

use OCA\Calendar\AppInfo\Application;
use OCA\DAV\CalDAV\CalDavBackend;
use OCP\Calendar\IManager;
use OCP\Collaboration\Reference\ADiscoverableReferenceProvider;
use OCP\Collaboration\Reference\IReference;
use OCP\Collaboration\Reference\Reference;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;
use Sabre\VObject\Reader;

class EventReferenceProvider extends ADiscoverableReferenceProvider {
	public function __construct(
		private readonly IL10N $l10n,
		private readonly IURLGenerator $urlGenerator,
		private readonly IManager $calendarManager,
		private CalDavBackend $calDavBackend,
		private readonly IDateTimeFormatter $dateTimeFormatter,
		private readonly ?string $userId,
	) {
	}

	#[\Override]
	public function getId(): string {
		return 'calendar-event';
	}

	#[\Override]
	public function getTitle(): string {
		return $this->l10n->t('Calendar event');
	}

	#[\Override]
	public function getOrder(): int {
		return 21;
	}

	#[\Override]
	public function getIconUrl(): string {
		return $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->imagePath(Application::APP_ID, 'calendar-dark.svg')
		);
	}

	#[\Override]
	public function matchReference(string $referenceText): bool {
		$start = $this->urlGenerator->getAbsoluteURL('/apps/' . Application::APP_ID);
		$startIndex = $this->urlGenerator->getAbsoluteURL('/index.php/apps/' . Application::APP_ID);

		foreach ([$start, $startIndex] as $base) {
			$quoted = preg_quote($base, '/');

			// URL pattern 1: .../apps/calendar/edit/{objectId}
			// URL pattern 2: .../apps/calendar/edit/{objectId}/{recurrenceId}
			if (preg_match('/^' . $quoted . '\/edit\/[^\/?#]+$/i', $referenceText) === 1) {
				return true;
			}

			// URL pattern 3: .../apps/calender/{view}/{timeRange}/edit/{mode}/{objectId}/{recurrenceId}
			$views = 'timeGridDay|timeGridWeek|dayGridMonth|multiMonthYear|listMonth';
			if (preg_match('/^' . $quoted . '\/(?:' . $views . ')\/[^\/]+\/edit\/(?:popover|full)\/[^\/?#]+/i', $referenceText) === 1) {
				return true;
			}
		}

		return false;
	}

	#[\Override]
	public function resolveReference(string $referenceText): ?IReference {
		if ($this->userId === null || !$this->matchReference($referenceText)) {
			return null;
		}

		$objectId = $this->getObjectIdFromUrl($referenceText);
		if ($objectId === null) {
			return null;
		}

		// objectId is base64(davUrl)
		$davUrl = base64_decode($objectId, true);
		if ($davUrl === false) {
			return null;
		}

		// DAV URL format: /remote.php/dav/calendars/{userid}/{calendarUri}/{eventFile}.ics
		$parts = explode('/', trim($davUrl, '/'));
		if (count($parts) < 2) {
			return null;
		}
		$eventFile = array_pop($parts); // e.g. 'event.ics'
		$calendarUri = array_pop($parts); // e.g. 'personal'
		if (empty($calendarUri) || empty($eventFile)) {
			return null;
		}

		$calendar = $this->getCalendar($calendarUri);
		if ($calendar === null) {
			return null;
		}

		$eventData = $this->getEventData($calendar['id'], $eventFile);
		if ($eventData === null) {
			return null;
		}

		$reference = new Reference($referenceText);
		$reference->setTitle($eventData['title']);
		$reference->setDescription($eventData['date'] ?? $calendar['{DAV:}displayname'] ?? '');
		$reference->setRichObject(
			'calendar_event',
			[
				'title' => $eventData['title'],
				'calendarName' => $calendar['{DAV:}displayname'] ?? '',
				'calendarColor' => $calendar['{http://apple.com/ns/ical/}calendar-color'] ?? null,
				'date' => $eventData['date'],
				'startTimestamp' => $eventData['startTimestamp'],
				'endTimestamp' => $eventData['endTimestamp'],
				'url' => $referenceText,
			]
		);
		return $reference;
	}

	private function getObjectIdFromUrl(string $url): ?string {
		// URL pattern 1+2: .../apps/calendar/edit/{objectId}[/{recurrenceId}]
		if (preg_match('/\/edit\/([^\/?#]+)/i', $url, $matches) === 1) {
			if (in_array($matches[1], ['popover', 'full'], true)) {
				// URL pattern 3: .../apps/calender/{view}/{timeRange}/edit/{mode}/{objectId}/{recurrenceId}
				if (preg_match('/\/edit\/(?:popover|full)\/([^\/?#]+)/i', $url, $m2)) {
					return $m2[1];
				}
				return null;
			}
			return $matches[1];
		}
		return null;
	}

	private function getCalendar(string $calendarUri): ?array {
		$principalUri = 'principals/users/' . $this->userId;
		$calendar = $this->calDavBackend->getCalendarByUri($principalUri, $calendarUri);
		if ($calendar === null || $calendar['{http://nextcloud.com/ns}deleted_at'] !== null) {
			return null;
		}
		return $calendar;
	}

	private function getEventData(int $calendarId, string $eventFile): ?array {
		$object = $this->calDavBackend->getCalendarObject($calendarId, $eventFile);
		if ($object === null) {
			return null;
		}

		$vObject = Reader::read($object['calendardata']);
		$vEvent = $vObject->VEVENT ?? null;
		if ($vEvent === null) {
			return null;
		}

		$date = null;
		$startTimestamp = null;
		if (isset($vEvent->DTSTART)) {
			$dt = $vEvent->DTSTART->getDateTime();
			$date = $this->dateTimeFormatter->formatTimeSpan(\DateTime::createFromInterface($dt));
			$startTimestamp = $dt->getTimestamp();
		}

		$endTimestamp = null;
		if (isset($vEvent->DTEND)) {
			$dt = $vEvent->DTEND->getDateTime();
			$endTimestamp = $dt->getTimestamp();
		} elseif (isset($vEvent->DURATION) && $startTimestamp !== null) {
			$duration = $vEvent->DURATION->getDateInterval();
			$endTimestamp = (new \DateTime())->setTimestamp($startTimestamp)->add($duration)->getTimestamp();
		}

		return [
			'title' => isset($vEvent->SUMMARY) ? (string)$vEvent->SUMMARY : $this->l10n->t('Untitled event'),
			'date' => $date,
			'startTimestamp' => $startTimestamp,
			'endTimestamp' => $endTimestamp,
			'location' => isset($vEvent->LOCATION) ? (string)$vEvent->LOCATION : null,
		];
	}

	#[\Override]
	public function getCachePrefix(string $referenceId): string {
		return $this->userId ?? '';
	}

	#[\Override]
	public function getCacheKey(string $referenceId): string {
		return $referenceId;
	}
}

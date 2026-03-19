<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Reference;

use OCA\Calendar\AppInfo\Application;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IManager;
use OCP\Collaboration\Reference\ADiscoverableReferenceProvider;
use OCP\Collaboration\Reference\IReference;
use OCP\Collaboration\Reference\Reference;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;

class EventReferenceProvider extends ADiscoverableReferenceProvider {
	public function __construct(
		private readonly IL10N $l10n,
		private readonly IURLGenerator $urlGenerator,
		private readonly IManager $calendarManager,
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
		if ($calendar->isDeleted()) {
			return null;
		}

		$eventData = $this->getEventData($calendar, $eventFile);
		if ($eventData === null) {
			return null;
		}

		$reference = new Reference($referenceText);
		$reference->setTitle($eventData['title']);
		$reference->setDescription($eventData['date'] ?? $calendar->getDisplayName());
		$reference->setRichObject(
			'calendar_event',
			[
				'title' => $eventData['title'],
				'calendarName' => $calendar->getDisplayName(),
				'calendarColor' => $calendar->getDisplayColor(),
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

	private function getCalendar(string $calendarUri): ICalendar {
		$principalUri = 'principals/users/' . $this->userId;
		$calendars = $this->calendarManager->getCalendarsForPrincipal($principalUri, [$calendarUri]);
		return $calendars[0];
	}

	private function getEventData(ICalendar $calendar, string $eventFile): ?array {
		$event = null;
		foreach ($calendar->search('') as $result) {
			if (($result['uri'] ?? null) === $eventFile) {
				$event = $result;
				break;
			}
		}
		if ($event === null) {
			return null;
		}

		$object = $event['objects'][0] ?? null;
		if ($object === null) {
			return null;

		}

		$date = null;
		$startTimestamp = null;
		/** @var \DateTimeInterface|null $dtStart */
		$dtStart = $object['DTSTART'][0] ?? null;
		if ($dtStart instanceof \DateTimeInterface) {
			$date = $this->dateTimeFormatter->formatTimeSpan(\DateTime::createFromInterface($dtStart));
			$startTimestamp = $dtStart->getTimestamp();
		}

		$endTimestamp = null;
		/** @var \DateTimeInterface|null $dtEnd */
		$dtEnd = $object['DTEND'][0] ?? null;
		if ($dtEnd instanceof \DateTimeInterface) {
			$endTimestamp = $dtEnd->getTimestamp();
		} elseif ($startTimestamp !== null) {
			$duration = $object['DURATION'][0] ?? null;
			if ($duration instanceof \DateInterval) {
				$endTimestamp = (new \DateTime())->setTimestamp($startTimestamp)->add($duration)->getTimestamp();
			}
		}

		return [
			'title' => $object['SUMMARY'][0] ?? $this->l10n->t('Untitled event'),
			'date' => $date,
			'startTimestamp' => $startTimestamp,
			'endTimestamp' => $endTimestamp,
			'location' => $object['LOCATION'][0] ?? null,
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

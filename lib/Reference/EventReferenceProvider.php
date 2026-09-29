<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Reference;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Service\ObjectResolverService;
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
		private readonly ObjectResolverService $objectResolverService,
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

			// URL pattern: .../apps/calendar/object/{uid}[/{recurrenceId}]
			if (preg_match('/^' . $quoted . '\/object\/[^\/?#]+(?:\/[^\/?#]+)?\/?$/i', $referenceText) === 1) {
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

		$uid = $this->getUidFromUrl($referenceText);
		if ($uid === null) {
			return null;
		}

		$resolved = $this->objectResolverService->findByUid($this->userId, $uid);
		if ($resolved === null) {
			return null;
		}

		$calendar = $this->getCalendar($resolved['calendarUri']);
		if ($calendar === null || $calendar->isDeleted()) {
			return null;
		}

		$eventData = $this->getEventData($calendar, $resolved['objectUri']);
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

	private function getUidFromUrl(string $url): ?string {
		// URL pattern: .../apps/calendar/object/{uid}[/{recurrenceId}]
		if (preg_match('/\/object\/([^\/?#]+)/i', $url, $matches) === 1) {
			return $matches[1];
		}
		return null;
	}

	private function getCalendar(string $calendarUri): ?ICalendar {
		$principalUri = 'principals/users/' . $this->userId;
		$calendars = $this->calendarManager->getCalendarsForPrincipal($principalUri, [$calendarUri]);
		return $calendars[0] ?? null;
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

<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Dashboard;

use DateInterval;
use DateTime;
use DateTimeImmutable;
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Service\JSDataService;
use OCP\AppFramework\Services\IInitialState;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\IManager;
use OCP\Dashboard\IAPIWidget;
use OCP\Dashboard\IAPIWidgetV2;
use OCP\Dashboard\IButtonWidget;
use OCP\Dashboard\IIconWidget;
use OCP\Dashboard\IOptionWidget;
use OCP\Dashboard\IReloadableWidget;
use OCP\Dashboard\Model\WidgetButton;
use OCP\Dashboard\Model\WidgetItem;
use OCP\Dashboard\Model\WidgetItems;
use OCP\Dashboard\Model\WidgetOptions;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;

class CalendarWidget implements IAPIWidget, IAPIWidgetV2, IButtonWidget, IIconWidget, IOptionWidget, IReloadableWidget {
	protected IL10N $l10n;
	protected IInitialState $initialStateService;
	protected JSDataService $dataService;
	protected IDateTimeFormatter $dateTimeFormatter;
	protected IURLGenerator $urlGenerator;
	protected IManager $calendarManager;
	protected ITimeFactory $timeFactory;

	/**
	 * CalendarWidget constructor.
	 */
	public function __construct(IL10N $l10n,
		IInitialState $initialStateService,
		JSDataService $dataService,
		IDateTimeFormatter $dateTimeFormatter,
		IURLGenerator $urlGenerator,
		IManager $calendarManager,
		ITimeFactory $timeFactory) {
		$this->l10n = $l10n;
		$this->initialStateService = $initialStateService;
		$this->dataService = $dataService;
		$this->dateTimeFormatter = $dateTimeFormatter;
		$this->urlGenerator = $urlGenerator;
		$this->calendarManager = $calendarManager;
		$this->timeFactory = $timeFactory;
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getId(): string {
		return Application::APP_ID;
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getTitle(): string {
		return $this->l10n->t('Upcoming events');
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getOrder(): int {
		return 2;
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getIconClass(): string {
		return 'app-icon-calendar';
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getUrl(): ?string {
		return null;
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getIconUrl(): string {
		return $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->imagePath(Application::APP_ID, 'calendar-dark.svg')
		);
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function load(): void {
		// No assets need to be loaded anymore as the widget is rendered from the API
	}

	#[\Override]
	public function getItems(string $userId, ?string $since = null, int $limit = 7): array {
		$calendars = $this->calendarManager->getCalendarsForPrincipal('principals/users/' . $userId);
		$count = count($calendars);
		if ($count === 0) {
			return [];
		}
		$dateTime = (new DateTimeImmutable())->setTimestamp($this->timeFactory->getTime());
		$inTwoWeeks = $dateTime->add(new DateInterval('P14D'));
		$options = [
			'timerange' => [
				'start' => $dateTime,
				'end' => $inTwoWeeks,
			]
		];
		$widgetItems = [];
		foreach ($calendars as $calendar) {
			if (method_exists($calendar, 'isEnabled') && $calendar->isEnabled() === false) {
				continue;
			}
			if ($calendar->isDeleted()) {
				continue;
			}
			$searchResult = $calendar->search('', [], $options, $limit);
			foreach ($searchResult as $calendarEvent) {
				// Find first recurrence in the future
				$recurrence = null;
				foreach ($calendarEvent['objects'] as $object) {
					/** @var DateTimeImmutable $startDate */
					$startDate = $object['DTSTART'][0];
					if ($startDate->getTimestamp() >= $dateTime->getTimestamp()) {
						$recurrence = $object;
						break;
					}
				}

				if ($recurrence === null) {
					continue;
				}

				$widget = new WidgetItem(
					$recurrence['SUMMARY'][0] ?? 'New Event',
					$this->dateTimeFormatter->formatTimeSpan(DateTime::createFromImmutable($startDate)),
					$this->urlGenerator->getAbsoluteURL($this->urlGenerator->linkToRoute('calendar.view.index', ['objectId' => $calendarEvent['uid']])),
					$this->urlGenerator->getAbsoluteURL($this->urlGenerator->linkToRoute('calendar.view.getCalendarDotSvg', ['color' => $calendar->getDisplayColor() ?? '#0082c9'])), // default NC blue fallback
					(string)$startDate->getTimestamp(),
				);
				$widgetItems[] = $widget;
			}
		}

		usort($widgetItems, static function (WidgetItem $a, WidgetItem $b) {
			return (int)$a->getSinceId() - (int)$b->getSinceId();
		});

		return $widgetItems;
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getItemsV2(string $userId, ?string $since = null, int $limit = 7): WidgetItems {
		$widgetItems = $this->getItems($userId, $since, $limit);

		$halfEmptyContentMessage = '';
		if (!empty($widgetItems)) {
			$startOfTomorrow = $this->timeFactory->getDateTime('tomorrow')->getTimestamp();
			if ($widgetItems[0]->getSinceId() >= $startOfTomorrow) {
				$halfEmptyContentMessage = $this->l10n->t('No more events today');
			}
		}

		return new WidgetItems(
			$widgetItems,
			empty($widgetItems) ? $this->l10n->t('No upcoming events') : '',
			$halfEmptyContentMessage,
		);
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getWidgetButtons(string $userId): array {
		return [
			new WidgetButton(
				WidgetButton::TYPE_MORE,
				$this->urlGenerator->getAbsoluteURL(
					$this->urlGenerator->linkToRoute(Application::APP_ID . '.view.index')
				),
				$this->l10n->t('More events')
			),
		];
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getWidgetOptions(): WidgetOptions {
		return new WidgetOptions(true);
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getReloadInterval(): int {
		return 600;
	}
}

<?php

declare(strict_types=1);
/**
 * @copyright Copyright (c) 2020 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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
use OCP\Dashboard\IButtonWidget;
use OCP\Dashboard\IIconWidget;
use OCP\Dashboard\IOptionWidget;
use OCP\Dashboard\Model\WidgetButton;
use OCP\Dashboard\Model\WidgetItem;
use OCP\Dashboard\Model\WidgetOptions;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\Util;

class CalendarWidget implements IAPIWidget, IButtonWidget, IIconWidget, IOptionWidget {
	protected IL10N $l10n;
	protected IInitialState $initialStateService;
	protected JSDataService $dataService;
	protected IDateTimeFormatter $dateTimeFormatter;
	protected IURLGenerator $urlGenerator;
	protected IManager $calendarManager;
	protected ITimeFactory $timeFactory;

	/**
	 * CalendarWidget constructor.
	 *
	 * @param IL10N $l10n
	 * @param IInitialState $initialStateService
	 * @param JSDataService $dataService
	 * @param IDateTimeFormatter $dateTimeFormatter
	 * @param IURLGenerator $urlGenerator
	 * @param IManager $calendarManager
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
	public function getId(): string {
		return Application::APP_ID;
	}

	/**
	 * @inheritDoc
	 */
	public function getTitle(): string {
		return $this->l10n->t('Upcoming events');
	}

	/**
	 * @inheritDoc
	 */
	public function getOrder(): int {
		return 2;
	}

	/**
	 * @inheritDoc
	 */
	public function getIconClass(): string {
		return 'app-icon-calendar';
	}

	/**
	 * @inheritDoc
	 */
	public function getUrl(): ?string {
		return null;
	}

	/**
	 * @inheritDoc
	 */
	public function getIconUrl(): string {
		return $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->imagePath(Application::APP_ID, 'calendar-dark.svg')
		);
	}

	/**
	 * @inheritDoc
	 */
	public function load(): void {
		Util::addScript(Application::APP_ID, 'calendar-dashboard');
		Util::addStyle(Application::APP_ID, 'dashboard');

		$this->initialStateService->provideLazyInitialState('dashboard_data', function () {
			return $this->dataService;
		});
	}

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
					(string) $startDate->getTimestamp(),
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
	public function getWidgetOptions(): WidgetOptions {
		return new WidgetOptions(true);
	}
}

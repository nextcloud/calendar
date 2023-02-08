<?php

declare(strict_types=1);
/**
 * @copyright Copyright (c) 2020 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
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
use OCA\DAV\CalDAV\CalendarImpl;
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
use OCP\IConfig;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\IUserManager;
use OCP\Util;
use Sabre\VObject\Component\VEvent;
use Sabre\VObject\Component\VTimeZone;
use Sabre\VObject\Parameter;
use Sabre\VObject\Property\VCard\Date;
use Sabre\Xml\Reader;

class CalendarWidget implements IAPIWidget, IButtonWidget, IIconWidget, IOptionWidget {
	private IL10N $l10n;
	private IInitialState $initialStateService;
	private JSDataService $dataService;
	private IDateTimeFormatter $dateTimeFormatter;
	private IURLGenerator $urlGenerator;
	private IManager $calendarManager;
	private ITimeFactory $timeFactory;
	private IConfig $config;

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
								ITimeFactory $timeFactory,
								IConfig $config) {
		$this->l10n = $l10n;
		$this->initialStateService = $initialStateService;
		$this->dataService = $dataService;
		$this->dateTimeFormatter = $dateTimeFormatter;
		$this->urlGenerator = $urlGenerator;
		$this->calendarManager = $calendarManager;
		$this->timeFactory = $timeFactory;
		$this->config = $config;
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

	/**
	 * @inheritDoc
	 *
	 * @param string|null $since Use any PHP DateTime allowed values to get future dates
	 * @param int $limit  Max 14 items is the default
	 */
	public function getItems(string $userId, ?string $since = null, int $limit = 7): array {
		// This is hw JS does it:
		//          const start = dateFactory()
		//			const end = dateFactory()
		//			end.setDate(end.getDate() + 14)
		//          const startOfToday = moment(start).startOf('day').toDate()
		// get all vevents in this time range
		// if "show tasks" is enabled, get all todos in the time range
		// sort events by time
		// filter events by:
		// .filter(event => !event.classNames.includes('fc-event-nc-task-completed'))
		// .filter(event => !event.classNames.includes('fc-event-nc-cancelled'))
		// filter out all events that are before the start of the day:
		// .filter(event => filterBefore.getTime() <= event.start.getTime())
		// decorate the items with url / task url, colour, etc

		$calendars = $this->calendarManager->getCalendarsForPrincipal('principals/users/' . $userId);
		$count = count($calendars);
		if ($count === 0) {
			return [];
		}

		$widgetItems = [];
		foreach ($calendars as $calendar) {
			$timezone = null;
			if($calendar instanceof CalendarImpl) {
				/** @var VTimeZone $vTimezone */
				$timezone = $calendar->getCalendarTimezoneString();
			}
			// make sure to include all day events
			$startTimeWithTimezone =  (!empty($timezone)) ? $this->timeFactory->getDateTime('today', new \DateTimeZone($timezone) ?? null) : $this->timeFactory->getDateTime('today');
			$endDate = clone $startTimeWithTimezone;
			$endDate->modify('+15 days');
			$options = [
				'timerange' => [
					'start' => $startTimeWithTimezone,
					'end' => $endDate,
				],
				'sort_asc' => [
					'firstoccurence'
				]
			];
			$searchResults = $calendar->search('', [], $options, $limit);
			foreach ($searchResults as $calendarEvent) {
				$dtStart = DateTime::createFromImmutable($calendarEvent['objects'][0]['DTSTART'][0]);
				$dtEnd = (isset($calendarEvent['objects'][0]['DTEND'])) ? DateTime::createFromImmutable($calendarEvent['objects'][0]['DTEND'][0]) : null;
				if(!empty($dtEnd) && $dtStart->diff($dtEnd)->days >= 1) {
					// All day (and longer)
					$timeString = $this->dateTimeFormatter->formatDateSpan($dtStart);
				} elseif(!empty($dtEnd)) {
					$timeString = $this->dateTimeFormatter->formatDateTime($dtStart, 'short', 'short') . ' - ' . $this->dateTimeFormatter->formatTime($dtEnd, 'short');
				} else {
					$timeString = $this->dateTimeFormatter->formatTimeSpan($dtStart, $startTimeWithTimezone);
				}
				$widget = new WidgetItem(
					$calendarEvent['objects'][0]['SUMMARY'][0] ?? 'New Event',
					$timeString,
					$this->urlGenerator->getAbsoluteURL($this->urlGenerator->linkToRoute('calendar.view.index', ['objectId' => $calendarEvent['uid']])),
					$this->urlGenerator->getAbsoluteURL($this->urlGenerator->linkToRoute('calendar.view.getCalendarDotSvg', ['color' => $calendar->getDisplayColor() ?? '#0082c9'])), // default NC blue fallback
					(string) $startTimeWithTimezone->getTimestamp(),
				);
				$widgetItems[] = $widget;
			}
		}
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

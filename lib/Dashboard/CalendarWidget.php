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
use OCA\DAV\CalDAV\CalDavBackend;
use OCP\AppFramework\Services\IInitialState;
use OCP\Dashboard\IAPIWidget;
use OCP\Dashboard\Model\WidgetItem;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\Util;

class CalendarWidget implements IAPIWidget {
	private IL10N $l10n;
	private IInitialState $initialStateService;
	private JSDataService $dataService;
	private IDateTimeFormatter $dateTimeFormatter;
	private IURLGenerator $urlGenerator;
	private CalDavBackend $calDavBackend;

	/**
	 * CalendarWidget constructor.
	 * @param IL10N $l10n
	 * @param IInitialState $initialStateService
	 * @param JSDataService $dataService
	 * @param IDateTimeFormatter $dateTimeFormatter
	 * @param IURLGenerator $urlGenerator
	 * @param CalDavBackend $calDavBackend
	 */
	public function __construct(IL10N $l10n,
								IInitialState $initialStateService,
								JSDataService $dataService,
								IDateTimeFormatter $dateTimeFormatter,
								IURLGenerator $urlGenerator,
								CalDavBackend $calDavBackend) {
		$this->l10n = $l10n;
		$this->initialStateService = $initialStateService;
		$this->dataService = $dataService;
		$this->dateTimeFormatter = $dateTimeFormatter;
		$this->urlGenerator = $urlGenerator;
		$this->calDavBackend = $calDavBackend;
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
	public function load(): void {
		Util::addScript(Application::APP_ID, 'calendar-dashboard');
		Util::addStyle(Application::APP_ID, 'dashboard');

		$this->initialStateService->provideLazyInitialState('dashboard_data', function () {
			return $this->dataService;
		});
	}

	/**
	 * @inheritDoc
	 */
	public function getItems(string $userId, ?string $since = null, int $limit = 7): array {
		$calendars = $this->calDavBackend->getCalendarsForUser('principals/users/' . $userId);
		$dateTimeNow = new DateTimeImmutable();
		$inTwoWeeks = $dateTimeNow->add(new DateInterval('P14D'));
		$events = [];
		$options = [
			'timerange' => [
				'start' => $dateTimeNow,
				'end' => $inTwoWeeks,
			]
		];
		$searchLimit = null;
		foreach ($calendars as $calKey => $calendar) {
			$searchResult = array_map(static function($event) use ($calendar, $dateTimeNow) {
				$event['calendar_color'] = $calendar['{http://apple.com/ns/ical/}calendar-color'];
				return $event;
			}, $this->calDavBackend->search($calendar, '', [], $options, $searchLimit, 0));
			array_push($events, ...$searchResult);
		}
		// for each event, is there a simple way to get the first occurrence in the future?

		return array_map(function(array $event) {
			/** @var DateTimeImmutable $startDate */
			$startDate = $event['objects'][0]['DTSTART'][0];
			return new WidgetItem(
				$event['objects'][0]['SUMMARY'][0] ?? '',
				$this->dateTimeFormatter->formatTimeSpan(DateTime::createFromImmutable($startDate)),
				// TODO fix this route and get the correct objectId
				$this->urlGenerator->getAbsoluteURL(
					$this->urlGenerator->linkToRoute('calendar.view.index', ['objectId' => $event['uid']])
				),
				// TODO find or implement and endpoint providing colored dots images
				// reminder: we can use the event color and the calendar color as a fallback
				'',
				// TODO this should be the next occurence date
				(string) $startDate->getTimestamp(),
			);
		}, $events);
	}
}

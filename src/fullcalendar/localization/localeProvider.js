/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { translate as t } from '@nextcloud/l10n'
import {
	getFirstDayOfWeekFromMomentLocale,
	getFirstDayOfYearFromMomentLocale,
} from '../../utils/moment.js'

/**
 *
 * @param {string} userLocale The user-selected locale
 * @param {string} momentLocale Our merged locale-language based moment locale
 * @return {object}
 */
const getFullCalendarLocale = (userLocale, momentLocale) => {
	return {
		code: userLocale.replace(/_/g, '-').toLowerCase(),
		week: {
			dow: getFirstDayOfWeekFromMomentLocale(momentLocale),
			doy: getFirstDayOfYearFromMomentLocale(momentLocale),
		},
		direction: 'ltr', // TODO - fix me
		buttonText: {
			prev: t('calendar', 'Prev'),
			next: t('calendar', 'Next'),
			prevYear: t('calendar', 'Prev year'),
			nextYear: t('calendar', 'Next year'),
			year: t('calendar', 'Year'),
			today: t('calendar', 'Today'),
			month: t('calendar', 'Month'),
			week: t('calendar', 'Week'),
			day: t('calendar', 'Day'),
			list: t('calendar', 'List'),
		},
		// TRANSLATORS W is an abbreviation for Week
		weekText: t('calendar', 'W'),
		allDayText: t('calendar', 'All day'),
		moreLinkText: (n) => t('calendar', '%n more', {}, n),
		noEventsText: t('calendar', 'No events to display'),
	}
}

export {
	getFullCalendarLocale,
}

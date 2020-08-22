/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
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
 * @param {String} userLocale The user-selected locale
 * @param {String} momentLocale Our merged locale-language based moment locale
 * @returns {Object}
 */
const getFullCalendarLocale = (userLocale, momentLocale) => {
	return {
		code: userLocale.replace('_', '-').toLowerCase(),
		week: {
			dow: getFirstDayOfWeekFromMomentLocale(momentLocale),
			doy: getFirstDayOfYearFromMomentLocale(momentLocale),
		},
		direction: 'ltr', // TODO - fix me
		buttonText: {
			prev: t('calendar', 'prev'),
			next: t('calendar', 'next'),
			prevYear: t('calendar', 'prev year'),
			nextYear: t('calendar', 'next year'),
			year: t('calendar', 'year'),
			today: t('calendar', 'today'),
			month: t('calendar', 'month'),
			week: t('calendar', 'week'),
			day: t('calendar', 'day'),
			list: t('calendar', 'list'),
		},
		// TRANSLATORS W is an abbreviation for Week
		weekText: t('calendar', 'W'),
		allDayText: t('calendar', 'all-day'),
		moreLinkText: (n) => t('calendar', '%n more', {}, n),
		noEventsText: t('calendar', 'No events to display'),
	}
}

export {
	getFullCalendarLocale,
}

/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from '@nextcloud/moment'
import { ROLLING_YEAR_LIST_VIEW } from '@/utils/router.js'

/**
 * Returns the date-formatting config for FullCalendar
 *
 * @param {import('@nextcloud/calendar-js').Timezone} timezone Calendar timezone
 * @return {object}
 */
function getDateFormattingConfig(timezone) {
	const defaultConfig = {
		dayHeaderFormat: 'ddd l',
		titleFormat: 'll',
		slotLabelFormat: 'LT',
	}
	const listConfig = {
		listDayFormat: 'LL, dddd',
		listDaySideFormat: false,
	}

	return {
		// Date formatting:
		eventTimeFormat: 'LT',
		views: {
			dayGridMonth: {
				...defaultConfig,
				dayHeaderFormat: 'ddd',
			},
			multiMonthYear: {
				...defaultConfig,
				dayHeaderFormat: 'ddd',
				multiMonthMaxColumns: 4,
			},
			timeGridDay: defaultConfig,
			timeGridWeek: defaultConfig,
			listMonth: listConfig,
			[ROLLING_YEAR_LIST_VIEW]: {
				...listConfig,
				type: 'list',
				visibleRange(currentDate) {
					const [year, month, day] = timezone.timestampToArray(currentDate.getTime())
					const date = moment.utc([year, month - 1, day])

					return {
						start: date.clone().startOf('month').toISOString().split('T')[0],
						end: date.add(1, 'year').toISOString().split('T')[0],
					}
				},
			},
			resourceTimelineDay: defaultConfig,
		},
	}
}

export { getDateFormattingConfig }

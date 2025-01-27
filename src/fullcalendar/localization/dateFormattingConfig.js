/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Returns the date-formatting config for FullCalendar
 *
 * @return {object}
 */
const getDateFormattingConfig = () => {
	const defaultConfig = {
		dayHeaderFormat: 'ddd l',
		titleFormat: 'll',
		slotLabelFormat: 'LT',
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
			listMonth: {
				// Changes for the List View
				listDayFormat: 'LL, dddd',
				listDaySideFormat: false,
			},
			resourceTimelineDay: defaultConfig,
		},
	}
}

export { getDateFormattingConfig }

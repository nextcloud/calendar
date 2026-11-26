/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Returns the date-formatting config for FullCalendar
 *
 * @return {object}
 */
function getDateFormattingConfig() {
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
			listYear: {
				...listConfig,
				dateAlignment: 'day',
			},
			resourceTimelineDay: defaultConfig,
		},
	}
}

export { getDateFormattingConfig }

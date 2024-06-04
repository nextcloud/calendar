/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

/**
 * Formats an alarm
 *
 * @param {object} alarm The alarm object to format
 * @param {boolean} isAllDay Whether or not the event is all-day
 * @param {string} currentUserTimezone The current timezone of the user
 * @param {string} locale The locale to format it in
 * @return {string}
 */
export default (alarm, isAllDay, currentUserTimezone, locale) => {
	if (alarm.relativeTrigger !== null) {
		// relative trigger
		if (isAllDay && alarm.relativeIsRelatedToStart && alarm.relativeTrigger < 86400) {
			if (alarm.relativeTrigger === 0) {
				return t('calendar', 'Midnight on the day the event starts')
			}

			const date = new Date()
			date.setHours(alarm.relativeHoursAllDay)
			date.setMinutes(alarm.relativeMinutesAllDay)
			date.setSeconds(0)
			date.setMilliseconds(0)
			const formattedHourMinute = moment(date).locale(locale).format('LT')

			if (alarm.relativeTrigger < 0) {
				if (alarm.relativeUnitAllDay === 'days') {
					return n('calendar',
						'%n day before the event at {formattedHourMinute}',
						'%n days before the event at {formattedHourMinute}',
						alarm.relativeAmountAllDay, {
							formattedHourMinute,
						})
				} else {
					return n('calendar',
						'%n week before the event at {formattedHourMinute}',
						'%n weeks before the event at {formattedHourMinute}',
						alarm.relativeAmountAllDay, {
							formattedHourMinute,
						})
				}
			}
			return t('calendar', 'on the day of the event at {formattedHourMinute}', {
				formattedHourMinute,
			})
		} else {
			// Alarms at the event's start or end
			if (alarm.relativeTrigger === 0) {
				if (alarm.relativeIsRelatedToStart) {
					return t('calendar', 'at the event\'s start')
				} else {
					return t('calendar', 'at the event\'s end')
				}
			}

			const time = moment.duration(Math.abs(alarm.relativeTrigger), 'seconds').locale(locale).humanize()

			if (alarm.relativeTrigger < 0) {
				if (alarm.relativeIsRelatedToStart) {
					return t('calendar', '{time} before the event starts', { time })
				} else {
					return t('calendar', '{time} before the event ends', { time })
				}
			}

			if (alarm.relativeIsRelatedToStart) {
				return t('calendar', '{time} after the event starts', { time })
			} else {
				return t('calendar', '{time} after the event ends', { time })
			}
		}
	} else {
		// absolute trigger
		if (currentUserTimezone === alarm.absoluteTimezoneId) {
			return t('calendar', 'on {time}', {
				time: moment(alarm.absoluteDate).locale(locale).format('LLLL'),
			})
		} else {
			return t('calendar', 'on {time} ({timezoneId})', {
				time: moment(alarm.absoluteDate).locale(locale).format('LLLL'),
				timezoneId: alarm.absoluteTimezoneId,
			})
		}
	}
}

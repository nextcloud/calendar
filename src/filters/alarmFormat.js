/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

/**
 * Formats an alarm
 *
 * @param {Object} alarm The alarm object to format
 * @param {Boolean} isAllDay Whether or not the event is all-day
 * @param {String} currentUserTimezone The current timezone of the user
 * @param {String} locale The locale to format it in
 * @returns {String}
 */
export default (alarm, isAllDay, currentUserTimezone, locale) => {
	if (alarm.relativeTrigger !== null) {
		// relative trigger
		const time = moment.duration(Math.abs(alarm.relativeTrigger), 'seconds').locale(locale).humanize()

		if (isAllDay && alarm.relativeIsRelatedToStart && alarm.relativeTrigger < 86400) {
			const date = new Date()
			date.setHours(alarm.relativeHoursAllDay)
			date.setMinutes(alarm.relativeMinutesAllDay)
			const formattedHourMinute = moment(date).locale(locale).format('LT')

			if (alarm.relativeTrigger === 0) {
				return t('calendar', 'Midnight on the day the event starts')
			}

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
			return t('calendar', 'on {time} {timezoneId}', {
				time: moment(alarm.absoluteDate).locale(locale).format('LLLL'),
				timezoneId: alarm.absoluteTimezoneId,
			})
		}
	}
}

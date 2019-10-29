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

import { translate, translatePlural } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

/**
 *
 * @param {Object} alarm The alarm object to format
 * @param {Boolean} isAllDay Whether or not the event is all-day
 * @param {String} currentUserTimezone The current timezone of the user
 * @returns {String}
 */
export default (alarm, isAllDay, currentUserTimezone) => {
	if (alarm.relativeTrigger !== null) {
		// relative trigger
		const time = moment.duration(Math.abs(alarm.relativeTrigger), 'seconds').humanize()

		if (isAllDay && alarm.relativeIsRelatedToStart && alarm.relativeTrigger < 86400) {
			const date = new Date()
			date.setHours(alarm.relativeHoursAllDay)
			date.setMinutes(alarm.relativeMinutesAllDay)
			const formattedHourMinute = moment(date).format('LT')

			if (alarm.relativeTrigger === 0) {
				return translate('calendar', 'Midnight on the day the event starts')
			}

			if (alarm.relativeTrigger < 0) {
				if (alarm.relativeUnitAllDay === 'days') {
					return translatePlural('calendar',
						'%n day before the event at {formattedHourMinute}',
						'%n days before the event at {formattedHourMinute}',
						alarm.relativeAmountAllDay, {
							formattedHourMinute,
						})
				} else {
					return translatePlural('calendar',
						'%n week before the event at {formattedHourMinute}',
						'%n weeks before the event at {formattedHourMinute}',
						alarm.relativeAmountAllDay, {
							formattedHourMinute,
						})
				}
			}
			return translate('calendar', 'on the day of the event at {formattedHourMinute}', {
				formattedHourMinute,
			})
		} else {
			// Alarms at the event's start or end
			if (alarm.relativeTrigger === 0) {
				if (alarm.relativeIsRelatedToStart) {
					return translate('calendar', 'at the event\'s start')
				} else {
					return translate('calendar', 'at the event\'s end')
				}
			}

			if (alarm.relativeTrigger < 0) {
				if (alarm.relativeIsRelatedToStart) {
					return translate('calendar', '{time} before the event starts', { time })
				} else {
					return translate('calendar', '{time} before the event ends', { time })
				}
			}

			if (alarm.relativeIsRelatedToStart) {
				return translate('calendar', '{time} after the event starts', { time })
			} else {
				return translate('calendar', '{time} after the event ends', { time })
			}
		}
	} else {
		// absolute trigger
		if (currentUserTimezone === alarm.absoluteTimezoneId) {
			return translate('calendar', 'on {time}', {
				time: moment(alarm.absoluteDate).format('LLLL'),
			})
		} else {
			return translate('calendar', 'on {time} {timezoneId}', {
				time: moment(alarm.absoluteDate).format('LLLL'),
				timezoneId: alarm.absoluteTimezoneId,
			})
		}
	}
}

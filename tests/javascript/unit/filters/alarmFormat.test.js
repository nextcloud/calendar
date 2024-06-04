/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import alarmFormat from "../../../../src/filters/alarmFormat.js";
import { translate, translatePlural } from '@nextcloud/l10n'

jest.mock('@nextcloud/l10n')

describe('format/alarmFormat test suite', () => {

	beforeEach(() => {
		translate.mockClear()
		translatePlural.mockClear()

		translate
			.mockImplementation((app, str) => str)

		translatePlural
			.mockImplementation((app, singStr, pluStr) => pluStr)
	})

	it('should format an alarm for an all-day event at midnight', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 0,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('Midnight on the day the event starts')
	})

	it('should format an alarm for an all-day event days before', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 1,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -15 * 60 * 60,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toMatchSnapshot()
	})

	it('should format an alarm for an all-day event weeks weeks before', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 1,
			relativeUnitAllDay: 'weeks',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -159 * 60 * 60 - 30 * 60,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toMatchSnapshot()
	})

	it('should format an alarm for an all-day event on the same day at a certain time', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: 32400,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toMatchSnapshot()
	})

	it('should format an alarm for an all-day event not supported in the default range', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 33,
			relativeUnitTimed: 'hours',
			relativeAmountAllDay: 1,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: 118800,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toMatchSnapshot()
	})

	it('should format a relative trigger at the events start', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 0,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('at the event\'s start')
	})

	it('should format a relative trigger at the events end', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: false,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 0,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('at the event\'s end')
	})

	it('should format a relative trigger before the event starts', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: -900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toMatchSnapshot()
	})

	it('should format a relative trigger before the event ends', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: false,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: -900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toMatchSnapshot()
	})

	it('should format a relative trigger after the event starts', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('{time} after the event starts')
	})

	it('should format a relative trigger after the event ends', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: false,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('{time} after the event ends')
	})

	it('should format an absolute alarm in the user\'s timezone', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		const alarm = {
			type: 'EMAIL',
			isRelative: false,
			absoluteDate: date,
			absoluteTimezoneId: 'Europe/Berlin',
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeAmountTimed: null,
			relativeUnitTimed: null,
			relativeAmountAllDay: null,
			relativeUnitAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('on {time}')
	})

	it('should format an absolute alarm in a different timezone', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		const alarm = {
			type: 'EMAIL',
			isRelative: false,
			absoluteDate: date,
			absoluteTimezoneId: 'America/New_York',
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeAmountTimed: null,
			relativeUnitTimed: null,
			relativeAmountAllDay: null,
			relativeUnitAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('on {time} ({timezoneId})')
	})

})

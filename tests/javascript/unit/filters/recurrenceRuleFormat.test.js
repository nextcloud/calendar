/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import recurrenceRuleFormat from '../../../../src/filters/recurrenceRuleFormat.js'
import { translate, translatePlural, getDayNames, getMonthNames } from '@nextcloud/l10n'

jest.mock('@nextcloud/l10n')

describe('format/recurrenceRuleFormat test suite', () => {

	beforeEach(() => {
		translate.mockClear()
		translatePlural.mockClear()

		translate
			.mockImplementation((app, str) => str)
		translatePlural
			.mockImplementation((app, sinStr, pluStr) => pluStr)
		getDayNames
			.mockReturnValue(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
		getMonthNames
			.mockReturnValue(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
	})

	it('should format a recurrence-rule that is non-recurring', () => {
		expect(recurrenceRuleFormat({
			frequency: 'NONE',
				interval: 1,
				count: null,
				until: null,
				byDay: [],
				byMonth: [],
				byMonthDay: [],
				bySetPosition: null,
				isUnsupported: false,
				recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every day', () => {
		expect(recurrenceRuleFormat({
			frequency: 'DAILY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring every day until a certain date', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)

		expect(recurrenceRuleFormat({
			frequency: 'DAILY',
			interval: 1,
			count: null,
			until: date,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring every day exactly 10 times', () => {
		expect(recurrenceRuleFormat({
			frequency: 'DAILY',
			interval: 1,
			count: 42,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every week on Tuesday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'WEEKLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['TU'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every third week on Tuesday and Thursday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'WEEKLY',
			interval: 3,
			count: null,
			until: null,
			byDay: ['TU', 'TH'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every other month on 15th', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 2,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every month on 15th, 16th, 17th, 18th', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [15, 16, 17, 18],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every month on last weekday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO', 'TU', 'WE', 'TH', 'FR'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: -1,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every month second Wednesday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['WE'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 2,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every year in May', () => {
		expect(recurrenceRuleFormat({
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [5],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every year in May, July, October on the 15th', () => {
		expect(recurrenceRuleFormat({
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [5, 7, 10],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

	it('should format a recurrence-rule that is recurring infinitely every year in May, July, October on third Thursday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['TH'],
			byMonth: [5, 7, 10],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toMatchSnapshot()
	})

})

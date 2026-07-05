/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	defaultAlarmsEqual,
	normalizeFromDav,
	toDavPayload,
	triggerToAlarmObject,
} from '../../../../src/utils/defaultCalendarAlarms.js'

describe('Test suite: defaultCalendarAlarms utils', () => {

	it('should normalize plural alarms from DAV', () => {
		expect(normalizeFromDav([
			{ trigger: -900, action: 'DISPLAY' },
			{ trigger: -3600, action: 'EMAIL' },
		], null)).toEqual([
			{ trigger: -900, action: 'DISPLAY' },
			{ trigger: -3600, action: 'EMAIL' },
		])
	})

	it('should fall back to legacy int when plural is empty', () => {
		expect(normalizeFromDav([], -900)).toEqual([
			{ trigger: -900, action: 'DISPLAY' },
		])
	})

	it('should return empty list when neither plural nor legacy is set', () => {
		expect(normalizeFromDav(null, null)).toEqual([])
	})

	it('should preserve all normalized alarms from DAV', () => {
		const plural = Array.from({ length: 12 }, (_, index) => ({
			trigger: -60 * (index + 1),
			action: 'DISPLAY',
		}))

		expect(normalizeFromDav(plural, null)).toHaveLength(12)
	})

	it('should serialize alarms for DAV', () => {
		expect(toDavPayload([
			{ trigger: -900, action: 'DISPLAY' },
			{ trigger: -3600, action: 'EMAIL' },
		])).toEqual([
			{ trigger: -900, action: 'DISPLAY' },
			{ trigger: -3600, action: 'EMAIL' },
		])
	})

	it('should return null for empty alarm lists', () => {
		expect(toDavPayload([])).toBeNull()
		expect(toDavPayload(null)).toBeNull()
	})

	it('should serialize large alarm lists for DAV', () => {
		const alarms = Array.from({ length: 11 }, (_, index) => ({
			trigger: -60 * (index + 1),
			action: 'DISPLAY',
		}))

		expect(toDavPayload(alarms)).toHaveLength(11)
	})

	it('should reject invalid alarm actions', () => {
		expect(() => toDavPayload([{ trigger: -900, action: 'AUDIO' }])).toThrow('Default alarm action must be DISPLAY or EMAIL')
	})

	it('should compare alarm lists for equality', () => {
		const alarmsA = [
			{ trigger: -900, action: 'DISPLAY' },
			{ trigger: -3600, action: 'EMAIL' },
		]
		const alarmsB = [
			{ trigger: -900, action: 'DISPLAY' },
			{ trigger: -3600, action: 'EMAIL' },
		]
		const alarmsC = [
			{ trigger: -900, action: 'EMAIL' },
		]

		expect(defaultAlarmsEqual(alarmsA, alarmsB)).toBe(true)
		expect(defaultAlarmsEqual(alarmsA, alarmsC)).toBe(false)
	})

	it('should build a relative alarm object from a trigger', () => {
		expect(triggerToAlarmObject(-900)).toEqual(expect.objectContaining({
			isRelative: true,
			relativeIsBefore: true,
			relativeTrigger: -900,
		}))
	})

})

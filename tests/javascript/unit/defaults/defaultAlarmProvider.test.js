/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import getDefaultAlarms from '../../../../src/defaults/defaultAlarmProvider.js'

describe('defaults/defaultAlarmProvider test suite', () => {

	it('should provide default alarms for timed events', () => {
		expect(getDefaultAlarms()).toEqual([
			0,
			-300,
			-600,
			-900,
			-1800,
			-3600,
			-7200,
			-86400,
			-172800,
		])
	})

	it('should provide default alarms for all-day events', () => {
		expect(getDefaultAlarms(true)).toEqual([
			32400,
			-54000,
			-140400,
			-572400,
		])
	})

})

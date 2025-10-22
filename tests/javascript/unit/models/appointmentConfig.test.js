/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import AppointmentConfig from '../../../../src/models/appointmentConfig.js'

vi.mock('@nextcloud/calendar-availability-vue')

describe('models/appointmentConfig test suite', () => {
	let windowSpy

	beforeEach(() => {
		windowSpy = vi.spyOn(window, 'window', 'get')
	})

	afterEach(() => {
		windowSpy.mockRestore()
	})

	test.each([
		[
			{ protocol: 'https:', host: 'nextcloud.testing' },
			'https://nextcloud.testing/nextcloud/index.php/apps/calendar/appointment/foobar'
		],
		[
			{ protocol: 'http:', host: 'nextcloud.testing' },
			'http://nextcloud.testing/nextcloud/index.php/apps/calendar/appointment/foobar',
		],
		[
			{ protocol: 'https:', host: 'nextcloud.testing:8443' },
			'https://nextcloud.testing:8443/nextcloud/index.php/apps/calendar/appointment/foobar',
		],
		[
			{ protocol: 'http:', host: 'nextcloud.testing:8080' },
			'http://nextcloud.testing:8080/nextcloud/index.php/apps/calendar/appointment/foobar',
		],
	])('should generate absolute URLs', (location, expected) => {
		windowSpy?.mockImplementation(() => ({
			location,
			_oc_webroot: '/nextcloud',
		}))
		const config = new AppointmentConfig({
			token: 'foobar',
		})
		expect(config.bookingUrl).toBe(expected)
	})
})

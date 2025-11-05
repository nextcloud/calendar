/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import AppointmentConfig from '../../../../src/models/appointmentConfig.js'
import { getBaseUrl } from '@nextcloud/router'

vi.mock('@nextcloud/calendar-availability-vue')
vi.mock('@nextcloud/router', () => ({
	generateUrl: vi.fn((url, params, options) => {
		const baseURL = options?.baseURL || ''
		let path = url
		if (params) {
			Object.keys(params).forEach(key => {
				path = path.replace(`{${key}}`, params[key])
			})
		}
		// When baseURL is provided, add /index.php prefix (mimics real Nextcloud router behavior)
		return baseURL + (baseURL ? '/index.php' : '') + path
	}),
	getBaseUrl: vi.fn(),
}))

describe('models/appointmentConfig test suite', () => {
	afterEach(() => {
		vi.clearAllMocks()
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
		const baseUrl = location.protocol + '//' + location.host + '/nextcloud'
		getBaseUrl.mockReturnValue(baseUrl)
		
		const config = new AppointmentConfig({
			token: 'foobar',
		})
		expect(config.bookingUrl).toBe(expected)
	})
})

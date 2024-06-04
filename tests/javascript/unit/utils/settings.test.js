/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getLinkToConfig } from '../../../../src/utils/settings.js'
import { linkTo } from '@nextcloud/router'
jest.mock('@nextcloud/router')

describe('utils/settings test suite', () => {

	beforeEach(() => {
		linkTo.mockClear()
	})

	it('should generate a link to the config api', () => {
		linkTo.mockImplementation(() => 'baseurl:')

		expect(getLinkToConfig('view')).toEqual('baseurl:/v1/config/view')
		expect(getLinkToConfig('weekends')).toEqual('baseurl:/v1/config/weekends')

		expect(linkTo).toHaveBeenCalledTimes(2)
		expect(linkTo).toHaveBeenNthCalledWith(1, 'calendar', 'index.php')
		expect(linkTo).toHaveBeenNthCalledWith(2, 'calendar', 'index.php')
	})
})

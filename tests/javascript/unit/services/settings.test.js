/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import HttpClient from '@nextcloud/axios'
import { getLinkToConfig } from '../../../../src/utils/settings.js'
import {setConfig} from "../../../../src/services/settings.js";

jest.mock('@nextcloud/axios')
jest.mock('../../../../src/utils/settings.js')

describe('Test suite: Settings service (services/settings.js)', () => {

	beforeEach(() => {
		HttpClient.post.mockClear()
		getLinkToConfig.mockClear()
	})

	it('should provide a setConfig method', () => {
		getLinkToConfig.mockReturnValueOnce('url-to-config-key')

		setConfig('key42', 'value1337')

		expect(getLinkToConfig).toHaveBeenCalledTimes(1)
		expect(getLinkToConfig).toHaveBeenNthCalledWith(1, 'key42')

		expect(HttpClient.post).toHaveBeenCalledTimes(1)
		expect(HttpClient.post).toHaveBeenNthCalledWith(1, 'url-to-config-key', {
			value: 'value1337'
		})
	})

})

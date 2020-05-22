/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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

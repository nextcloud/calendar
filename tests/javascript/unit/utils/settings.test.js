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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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

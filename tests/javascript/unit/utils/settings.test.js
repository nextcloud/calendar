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
import {
	getConfigValueFromHiddenInput,
	getLinkToConfig
} from '../../../../src/utils/settings.js'

jest.mock('@nextcloud/router')

describe('utils/settings test suite', () => {

	it('should read a config value from DOM', () => {
		document.body.innerHTML = `
<input id="config-first-day" value="1" />
<input id="config-show-weekends" value="0" />
`

		expect(getConfigValueFromHiddenInput('first-day')).toEqual('1')
		expect(getConfigValueFromHiddenInput('show-weekends')).toEqual('0')
		expect(getConfigValueFromHiddenInput('show-week-numbers')).toEqual(null)
	})

	it('should generate a link to the config api', () => {
		expect(getLinkToConfig('view')).toEqual('linkTo###calendar###index.php/v1/config/view')
		expect(getLinkToConfig('weekends')).toEqual('linkTo###calendar###index.php/v1/config/weekends')
	})
})

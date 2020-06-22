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
import davRestrictionsStore from '../../../../src/store/davRestrictions.js'

describe('store/davRestrictions test suite', () => {

	it('should provide a default state', () => {
		// Minimum Date should be the start of Unix-Date
		expect(davRestrictionsStore.state.minimumDate).toEqual('1970-01-01T00:00:00Z')

		// Maximum Date should prevent the Year 2038 problem
		expect(davRestrictionsStore.state.maximumDate).toEqual('2037-12-31T23:59:59Z')
	})

	it('should provide a mutation to set the default value', () => {
		const state = {
			minimumDate: '1970-01-01T00:00:00Z',
			maximumDate: '2037-12-31T23:59:59Z',
			otherProp: 'foo',
		}

		davRestrictionsStore.mutations.loadDavRestrictionsFromServer(state, {
			minimumDate: '2010-01-01T00:00:00Z',
			maximumDate: '2019-12-31T23:59:59Z',
		})

		expect(state).toEqual({
			minimumDate: '2010-01-01T00:00:00Z',
			maximumDate: '2019-12-31T23:59:59Z',
			otherProp: 'foo',
		})
	})

})

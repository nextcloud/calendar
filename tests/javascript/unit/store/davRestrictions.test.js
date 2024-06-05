/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

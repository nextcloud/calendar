/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useDavRestrictionsStore from '../../../../src/store/davRestrictions.js'
import { setActivePinia, createPinia } from 'pinia'

describe('store/davRestrictions test suite', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should provide a default state', () => {
		const davRestrictionsStore = useDavRestrictionsStore()

		// Minimum Date should be the start of Unix-Date
		expect(davRestrictionsStore.minimumDate).toEqual('1970-01-01T00:00:00Z')

		// Maximum Date should prevent the Year 2038 problem
		expect(davRestrictionsStore.maximumDate).toEqual('2037-12-31T23:59:59Z')
	})

	it('should provide a mutation to set the default value', () => {
		const davRestrictionsStore = useDavRestrictionsStore()

		davRestrictionsStore.loadDavRestrictionsFromServer({
			minimumDate: '2010-01-01T00:00:00Z',
			maximumDate: '2019-12-31T23:59:59Z',
		})

		expect(davRestrictionsStore.$state).toEqual({
			minimumDate: '2010-01-01T00:00:00Z',
			maximumDate: '2019-12-31T23:59:59Z',
		})
	})

})

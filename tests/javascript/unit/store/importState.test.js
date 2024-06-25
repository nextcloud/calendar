/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useImportStateStore from '../../../../src/store/importState.js'
import { setActivePinia, createPinia } from 'pinia'

import {
	IMPORT_STAGE_AWAITING_USER_SELECT,
	IMPORT_STAGE_DEFAULT,
} from "../../../../src/models/consts.js";

describe('store/importState test suite', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should provide a default state', () => {
		const importStateStore = useImportStateStore()

		expect(importStateStore.$state).toEqual({
			total: 0,
			accepted: 0,
			denied: 0,
			stage: IMPORT_STAGE_DEFAULT,
		})
	})

	it('should provide a mutation to reset the state', () => {
		const importStateStore = useImportStateStore()

		const state = {
			stage: IMPORT_STAGE_AWAITING_USER_SELECT,
			total: 1337,
			accepted: 42,
			denied: 500,
		}

		importStateStore.$state = state

		importStateStore.resetState()

		expect(importStateStore.$state).toEqual({
			total: 0,
			accepted: 0,
			denied: 0,
			stage: IMPORT_STAGE_DEFAULT,
		})
	})

})

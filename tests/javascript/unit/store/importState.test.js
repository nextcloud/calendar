/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import importStateStore from '../../../../src/store/importState.js'
import {
	IMPORT_STAGE_AWAITING_USER_SELECT,
	IMPORT_STAGE_DEFAULT,
	IMPORT_STAGE_IMPORTING,
	IMPORT_STAGE_PROCESSING
} from "../../../../src/models/consts.js";

describe('store/importState test suite', () => {

	it('should provide a default state', () => {
		expect(importStateStore.state).toEqual({
			total: 0,
			accepted: 0,
			denied: 0,
			stage: IMPORT_STAGE_DEFAULT,
		})
	})

	it('should provide a mutation to increment the amount of accepted imports', () => {
		const state = {
			accepted: 5,
		}

		importStateStore.mutations.incrementAccepted(state)

		expect(state.accepted).toEqual(6)
	})

	it('should provide a mutation to increment the amount of rejected imports', () => {
		const state = {
			denied: 41,
		}

		importStateStore.mutations.incrementDenied(state)

		expect(state.denied).toEqual(42)
	})

	it('should provide a mutation to increment the total amount of objects', () => {
		const state = {
			total: 5,
		}

		importStateStore.mutations.setTotal(state, 1337)

		expect(state.total).toEqual(1337)
	})

	it('should provide a mutation to change the stage of the import', () => {
		const state = {
			stage: null,
		}

		importStateStore.mutations.changeStage(state, IMPORT_STAGE_DEFAULT)
		expect(state.stage).toEqual(IMPORT_STAGE_DEFAULT)

		importStateStore.mutations.changeStage(state, IMPORT_STAGE_PROCESSING)
		expect(state.stage).toEqual(IMPORT_STAGE_PROCESSING)

		importStateStore.mutations.changeStage(state, IMPORT_STAGE_IMPORTING)
		expect(state.stage).toEqual(IMPORT_STAGE_IMPORTING)

		importStateStore.mutations.changeStage(state, IMPORT_STAGE_AWAITING_USER_SELECT)
		expect(state.stage).toEqual(IMPORT_STAGE_AWAITING_USER_SELECT)
	})

	it('should provide a mutation to reset the state', () => {
		const state = {
			stage: IMPORT_STAGE_AWAITING_USER_SELECT,
			total: 1337,
			accepted: 42,
			denied: 500,
		}

		importStateStore.mutations.resetState(state)

		expect(state).toEqual({
			total: 0,
			accepted: 0,
			denied: 0,
			stage: IMPORT_STAGE_DEFAULT,
		})
	})

})

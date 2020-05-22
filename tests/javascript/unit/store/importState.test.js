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

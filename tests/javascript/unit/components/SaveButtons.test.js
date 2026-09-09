/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import SaveButtons from '@/components/Editor/SaveButtons.vue'

describe('components/Editor/SaveButtons', () => {
	/**
	 * Compute the visible controls for the given props.
	 *
	 * @param {object} overrides Props to override
	 * @return {object} Visibility by control
	 */
	function getVisibility(overrides = {}) {
		const vm = {
			isReadOnly: false,
			isNew: false,
			canUpdateOccurrence: false,
			canUpdateFuture: false,
			canUpdateSeries: false,
			...overrides,
		}
		vm.allowedUpdateScopeCount = SaveButtons.computed.allowedUpdateScopeCount.call(vm)

		return {
			save: SaveButtons.computed.showSaveButton.call(vm),
			update: SaveButtons.computed.showUpdateButton.call(vm),
			future: SaveButtons.computed.showUpdateFutureButton.call(vm),
			series: SaveButtons.computed.showUpdateSeriesButton.call(vm),
			menu: SaveButtons.computed.showUpdateMenu.call(vm),
		}
	}

	it.each([
		[{ isNew: true, canUpdateOccurrence: true }, { save: true, update: false, future: false, series: false, menu: false }],
		[{ canUpdateOccurrence: true }, { save: false, update: true, future: false, series: false, menu: false }],
		[{ canUpdateFuture: true }, { save: false, update: false, future: true, series: false, menu: false }],
		[{ canUpdateSeries: true }, { save: false, update: false, future: false, series: true, menu: false }],
		[{ canUpdateOccurrence: true, canUpdateFuture: true, canUpdateSeries: true }, { save: false, update: false, future: false, series: false, menu: true }],
		[{ isReadOnly: true, canUpdateOccurrence: true }, { save: false, update: false, future: false, series: false, menu: false }],
	])('shows the controls for the allowed update scopes', (props, expected) => {
		expect(getVisibility(props)).toEqual(expected)
	})

	it.each([
		['saveOccurrence', 'saveOccurrence'],
		['saveFuture', 'saveFuture'],
		['saveSeries', 'saveSeries'],
		['showMore', 'showMore'],
	])('%s emits %s', (method, event) => {
		const $emit = vi.fn()

		SaveButtons.methods[method].call({ $emit })

		expect($emit).toHaveBeenCalledWith(event)
	})
})

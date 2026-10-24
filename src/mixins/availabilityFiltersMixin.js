/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default {
	props: {
		/**
		 * Every filter value by key, null when not set
		 */
		filters: {
			type: Object,
			default: () => ({}),
		},
	},

	methods: {
		/**
		 * Map raw values to select options labelled with the value itself.
		 *
		 * @param {string[]|undefined} values The raw values
		 * @return {{value: string, label: string}[]} The options
		 */
		toOptions(values) {
			return (values ?? []).map((value) => ({ value, label: value }))
		},

		/**
		 * The option matching a filter's current value.
		 *
		 * @param {string} key The filter key
		 * @param {{value: string}[]} options The select's options
		 * @return {object|null} The selected option or null
		 */
		selectedOption(key, options) {
			return options.find((option) => option.value === this.filters[key]) ?? null
		},

		/**
		 * Emit the filters with one key changed.
		 *
		 * @param {string} key The filter key
		 * @param {string|number|null} value The new value, null to clear it
		 */
		setFilter(key, value) {
			this.$emit('update:filters', { ...this.filters, [key]: value })
		},

		/**
		 * Set a select-backed filter.
		 *
		 * @param {string} key The filter key
		 * @param {{value: string}|null} option The chosen option, null when cleared
		 */
		setSelect(key, option) {
			this.setFilter(key, option?.value ?? null)
		},

		/**
		 * The options matching a multi-select filter's current values.
		 *
		 * @param {string} key The filter key
		 * @param {{value: string}[]} options The select's options
		 * @return {object[]} The selected options
		 */
		selectedOptions(key, options) {
			const values = this.filters[key] ?? []
			return options.filter((option) => values.includes(option.value))
		},

		/**
		 * Set a multi-select filter.
		 *
		 * @param {string} key The filter key
		 * @param {{value: string}[]|null} options The chosen options
		 */
		setMultiSelect(key, options) {
			this.setFilter(key, (options ?? []).map((option) => option.value))
		},

		/**
		 * Set a minimum filter from a number field. Anything that is not a
		 * non-negative integer clears it.
		 *
		 * @param {string} key The filter key
		 * @param {string} value The raw input value
		 */
		setMinimum(key, value) {
			const number = parseInt(value, 10)
			this.setFilter(key, Number.isNaN(number) || number < 0 ? null : number)
		},
	},
}

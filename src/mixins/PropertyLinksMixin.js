/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { find as findLinks } from 'linkifyjs'

export default {
	props: {
		linkifyLinks: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		showLinksClickable() {
			return this.linkifyLinks
				&& this.textareaHasFocus === false
				&& typeof this.value === 'string'
				&& this.value.length > 4
				&& findLinks(this.value).length > 0
		},
		linkifyMinHeight() {
			// return this.rows > 1 ? '68px' : '48px'
			return '0'
		},
	},
	data() {
		return {
			textareaHasFocus: false,
		}
	},

	methods: {
		handleShowTextarea(evt) {

			if (this.isReadOnly || this.linkifyLinks === false) {
				// do nothing
				return
			}
			if (evt.target && evt.target.tagName === 'A') {
				// a link was clicked, do nothing
				return
			}
			if (this.textareaHasFocus === true) {
				// the textarea is shown already, should never happen
				console.error('this.textareaHasFocus is true but click event is dispatched on div')
				return
			}

			const parent = evt.currentTarget.parentElement
			this.textareaHasFocus = true

			this.$nextTick(() => {
				if (parent && parent.firstElementChild) {
					const textarea = parent.firstElementChild
					textarea.focus()
					if (this.value && this.value.length > 64) {
						textarea.selectionStart = textarea.selectionEnd = 0
					} else {
						textarea.selectionStart = textarea.selectionEnd = 64
					}
				}
			})
		},

		/**
		 * @param {boolean} hasFocus
		 */
		handleToggleTextareaFocus(hasFocus) {
			if (this.linkifyLinks === false) {
				// do nothing
				return
			}
			this.textareaHasFocus = hasFocus
		},
	},
}

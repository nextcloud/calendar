/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default {
	mounted(el) {
		setTimeout(() => {
			const input = el.querySelector('input') || el
			input.focus()
		}, 100)
	},
}

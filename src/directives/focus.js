/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default {
	inserted(el) {
		el.focus()
		// Adding a delay ensures the element receives focus even if the directive is triggered 
		// before the component is fully mounted (e.g., during event creation).
		setTimeout(() => {
			el.focus()
		}, 100)
	},
}

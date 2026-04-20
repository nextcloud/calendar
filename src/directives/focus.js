/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default {
	inserted(el) {
		setTimeout(() => {
			el.focus()
		}, 500)
	},
}

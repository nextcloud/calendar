/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

declare module '*.vue' {
	import Vue from 'vue'
	export default Vue
}

declare module '@nextcloud/*' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const content: any
	export = content
}

declare module 'vue-material-design-icons/*' {
	import Vue from 'vue'
	export default Vue
}

declare module 'vuedraggable' {
	import Vue from 'vue'
	export default Vue
}

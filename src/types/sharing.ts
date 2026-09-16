// SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * A sharee candidate as offered by the "Share with users or groups" search,
 * covering DAV principals, circles (teams), and remote (federated) users.
 */
export interface ShareeOption {
	user: string
	displayName: string
	icon?: string
	uri: string
	isGroup: boolean
	isCircle: boolean
	isRemoteUser: boolean
	isNoUser: boolean
	search: string
	email?: string
}

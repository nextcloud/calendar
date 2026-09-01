// SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

export type AutocompleteEntryStatus = {
	status: string
	message: string
	icon: string
	clearAt: number
}

export type AutocompleteEntry = {
	id: string
	label: string
	icon: string
	source: string
	status?: AutocompleteEntryStatus
	subline?: string
	shareWithDisplayNameUnique?: string
}

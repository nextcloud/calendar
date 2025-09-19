// SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

export type OcsMeta = {
	status: string
	statuscode: number
	message: string
	totalitems: string
	itemsperpage: string
}

export type OcsErrorData = {
	error: string
	message?: string
}

export type OcsEnvelope<T> = {
	ocs: {
		meta: OcsMeta
		data: T | OcsErrorData
	}
}

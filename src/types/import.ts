/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type ImportFormat = 'ical' | 'jcal' | 'xcal'
export type ImportDisposition = 'created' | 'updated' | 'exists' | 'error'
export type ImportSessionStage = 'idle' | 'preparing' | 'selecting' | 'importing' | 'completed' | 'error'

export type ImportFileSource = {
	id: number
	name: string
	contents: string
	lastModified: number
	size: number
	type: string
	parser: {
		getName?: () => string | null
		getColor?: () => string | null
		containsVEvents: () => boolean
		containsVTodos: () => boolean
		containsVJournals: () => boolean
	}
}

export type ImportFileAdd = Omit<ImportFileSource, 'id' | 'parser'> & {
	parser: ImportFileSource['parser']
}

export interface ImportFileOptions {
	format: ImportFormat
	supersede: boolean
}

export interface ImportFileEntry {
	file: ImportFileSource
	calendarId: string | null
	options: ImportFileOptions
}

export interface ImportCounters {
	discovered: number
	processed: number
	created: number
	updated: number
	exists: number
	error: number
}

export interface ImportSession {
	fileId: number
	fileName: string
	targetDisplayName: string
	targetUri: string | null
	status: 'pending' | 'importing' | 'completed' | 'error'
	counters: ImportCounters
	recentResults: ImportStreamObjectResponse[]
	lastError: string | null
}

export interface ImportStreamRequest {
	transaction: string
	target: string
	options: {
		format: ImportFormat
		validation: number
		errors: number
		supersede: boolean
	}
	data: string
	user?: string
}

export interface ImportStreamStartResponse {
	type: 'control'
	transaction: string
	disposition: 'start'
}

export interface ImportStreamEndResponse {
	type: 'control'
	transaction: string
	disposition: 'end'
}

export interface ImportStreamCountResponse {
	type: 'count'
	transaction: string
	vevent: number
	vtodo: number
	vjournal: number
}

export interface ImportStreamObjectResponse {
	type: 'object'
	transaction: string
	identifier: string | null
	disposition: ImportDisposition
	errors: string[]
}

export type ImportStreamDataResponse = ImportStreamCountResponse | ImportStreamObjectResponse

export type ImportStreamResponse
	= | ImportStreamStartResponse
		| ImportStreamEndResponse
		| ImportStreamCountResponse
		| ImportStreamObjectResponse

export type ImportRequest = Omit<ImportStreamRequest, 'transaction'>

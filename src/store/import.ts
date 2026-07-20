/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {
	ImportCounters,
	ImportFileAdd,
	ImportFileEntry,
	ImportFileOptions,
	ImportFileSource,
	ImportFormat,
	ImportRequest,
	ImportSession,
	ImportSessionStage,
	ImportStreamDataResponse,
} from '@/types/import'

import { translate as t } from '@nextcloud/l10n'
import { defineStore } from 'pinia'
import { computed, markRaw, ref } from 'vue'
import { mapDavCollectionToCalendar } from '@/models/calendar.js'
import { createCalendar } from '@/services/caldavService.js'
import { importService } from '@/services/importService'
import useCalendarsStore from '@/store/calendars.js'
import usePrincipalsStore from '@/store/principals.js'
import { uidToHexColor } from '@/utils/color.js'

/**
 * Create a fresh counter object for import progress aggregation.
 */
function createEmptyCounters(): ImportCounters {
	return {
		discovered: 0,
		processed: 0,
		created: 0,
		updated: 0,
		exists: 0,
		error: 0,
	}
}

/**
 * Map a file MIME type to the backend import format.
 *
 * @param type MIME type of the imported file
 */
function determineFileFormat(type: string): ImportFormat {
	switch (type) {
		case 'application/calendar+json':
			return 'jcal'
		case 'application/calendar+xml':
			return 'xcal'
		default:
			return 'ical'
	}
}

/**
 * Extract the calendar URI expected by the import controller from a CalDAV URL.
 *
 * @param url CalDAV collection URL
 */
function getCalendarUriFromUrl(url: string): string {
	const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url
	return normalizedUrl.slice(normalizedUrl.lastIndexOf('/') + 1)
}

export default defineStore('import', () => {
	const lastFileInsertId = ref(-1)
	const files = ref<ImportFileEntry[]>([])
	const stage = ref<ImportSessionStage>('idle')
	const running = ref(false)
	const activeFileId = ref<number | null>(null)
	const lastError = ref<string | null>(null)
	const sessions = ref<Record<number, ImportSession>>({})
	const order = ref<number[]>([])

	const totals = computed<ImportCounters>(() => {
		return order.value.reduce<ImportCounters>((aggregate, fileId) => {
			const session = sessions.value[fileId]
			if (!session) {
				return aggregate
			}

			aggregate.discovered += session.counters.discovered
			aggregate.processed += session.counters.processed
			aggregate.created += session.counters.created
			aggregate.updated += session.counters.updated
			aggregate.exists += session.counters.exists
			aggregate.error += session.counters.error
			return aggregate
		}, createEmptyCounters())
	})

	const activeSession = computed(() => {
		return activeFileId.value !== null ? sessions.value[activeFileId.value] ?? null : null
	})

	/**
	 * Adds a file to the import queue.
	 *
	 * @param data File metadata and parser
	 */
	function addFile({ contents, lastModified, name, parser, size, type }: ImportFileAdd): void {
		const file: ImportFileSource = {
			id: ++lastFileInsertId.value,
			contents,
			lastModified,
			name,
			parser: markRaw(parser),
			size,
			type,
		}

		files.value = [...files.value, {
			file,
			calendarId: null,
			options: {
				format: determineFileFormat(file.type),
				supersede: false,
			},
		}]
	}

	/**
	 * Clear the queued import files and their per-file selections.
	 */
	function removeAllFiles(): void {
		files.value = []
	}

	/**
	 * Reset the active import session state.
	 */
	function reset(): void {
		stage.value = 'idle'
		running.value = false
		activeFileId.value = null
		lastError.value = null
		sessions.value = {}
		order.value = []
	}

	/**
	 * Find a queued entry by its file id.
	 *
	 * @param fileId Imported file identifier
	 */
	function getEntry(fileId: number): ImportFileEntry | undefined {
		return files.value.find((entry) => entry.file.id === fileId)
	}

	/**
	 * Associate a queued file with a selected calendar id.
	 *
	 * @param data File and calendar identifiers
	 */
	function setCalendarForFile({ fileId, calendarId }: { fileId: number, calendarId: string }): void {
		const entry = getEntry(fileId)
		if (entry) {
			entry.calendarId = calendarId
		}
	}

	/**
	 * Override the import options for a queued file.
	 *
	 * @param data File identifier and the options to merge
	 */
	function setOptionsForFile({ fileId, options }: { fileId: number, options: Partial<ImportFileOptions> }): void {
		const entry = getEntry(fileId)
		if (entry) {
			entry.options = { ...entry.options, ...options }
		}
	}

	/**
	 * Resolve or create the destination calendar for a queued entry.
	 *
	 * @param entry Entry being imported
	 */
	async function ensureCalendarForEntry(entry: ImportFileEntry): Promise<{ id: string, uri: string, displayName: string }> {
		const calendarsStore = useCalendarsStore()
		const principalsStore = usePrincipalsStore()
		const { file, calendarId } = entry

		if (calendarId !== 'new') {
			const calendar = calendarId !== null ? calendarsStore.getCalendarById(calendarId) : null
			if (!calendar) {
				throw new Error(t('calendar', 'Selected calendar not found'))
			}

			return {
				id: calendar.id,
				uri: getCalendarUriFromUrl(calendar.url),
				displayName: calendar.displayName,
			}
		}

		const displayName = file.parser.getName?.() || t('calendar', 'Imported {filename}', {
			filename: file.name,
		})
		const color = file.parser.getColor?.() || uidToHexColor(displayName)
		const components: string[] = []
		if (file.parser.containsVEvents()) {
			components.push('VEVENT')
		}
		if (file.parser.containsVJournals()) {
			components.push('VJOURNAL')
		}
		if (file.parser.containsVTodos()) {
			components.push('VTODO')
		}

		const response = await createCalendar(displayName, color, components, 0)
		const calendar = mapDavCollectionToCalendar(response, principalsStore.getCurrentUserPrincipal)
		calendarsStore.addCalendarMutation({ calendar })
		setCalendarForFile({
			fileId: file.id,
			calendarId: calendar.id,
		})

		return {
			id: calendar.id,
			uri: getCalendarUriFromUrl(calendar.url),
			displayName: calendar.displayName,
		}
	}

	/**
	 * Stream-import all selected files sequentially while preserving live counters.
	 */
	async function startImport(): Promise<ImportCounters> {
		const entries = files.value.slice()
		if (entries.length === 0) {
			return createEmptyCounters()
		}

		sessions.value = Object.fromEntries(entries.map(({ file }) => [file.id, {
			fileId: file.id,
			fileName: file.name,
			targetDisplayName: '',
			targetUri: null,
			status: 'pending',
			counters: createEmptyCounters(),
			recentResults: [],
			lastError: null,
		}]))
		order.value = entries.map(({ file }) => file.id)
		stage.value = 'importing'
		running.value = true
		lastError.value = null

		try {
			for (const entry of entries) {
				const { file, options } = entry
				activeFileId.value = file.id
				const session = sessions.value[file.id]
				if (!session) {
					continue
				}

				session.status = 'importing'
				const target = await ensureCalendarForEntry(entry)
				session.targetDisplayName = target.displayName
				session.targetUri = target.uri

				const request: ImportRequest = {
					target: target.uri,
					options: {
						format: options.format,
						validation: 1,
						errors: 0,
						supersede: options.supersede,
					},
					data: file.contents,
				}

				await importService.import(request, (event) => handleEvent(file.id, event))
				session.status = session.counters.error > 0 ? 'error' : 'completed'
			}

			stage.value = 'completed'
			return totals.value
		} catch (error) {
			stage.value = 'error'
			lastError.value = error instanceof Error ? error.message : t('calendar', 'Import failed')
			if (activeFileId.value !== null && sessions.value[activeFileId.value]) {
				sessions.value[activeFileId.value].status = 'error'
				sessions.value[activeFileId.value].lastError = lastError.value
			}
			throw error
		} finally {
			running.value = false
			activeFileId.value = null
		}
	}

	/**
	 * Reduce a streamed import event into the per-file session state.
	 *
	 * @param fileId Imported file identifier
	 * @param event Streamed import event
	 */
	function handleEvent(fileId: number, event: ImportStreamDataResponse): void {
		const session = sessions.value[fileId]
		if (!session) {
			return
		}

		if (event.type === 'count') {
			session.counters.discovered = event.vevent + event.vtodo + event.vjournal
			return
		}

		session.recentResults = [event, ...session.recentResults].slice(0, 25)
		session.counters.processed += 1
		session.counters[event.disposition] += 1
	}

	return {
		activeSession,
		addFile,
		files,
		lastError,
		lastFileInsertId,
		order,
		removeAllFiles,
		reset,
		running,
		sessions,
		setCalendarForFile,
		setOptionsForFile,
		stage,
		startImport,
		totals,
	}
})

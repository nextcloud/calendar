/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * State of the open event editor.
 */
export interface EventEditorState {
	/** UID of the edited event, kept when a new event is saved */
	eventId: string
	/**
	 * Id of the calendar object of the edited event, `null` for a new event not saved yet.
	 * Distinguishes copies of an event with the same UID in different calendars.
	 * Kept when the event is moved to another calendar.
	 */
	calendarObjectId: string | null
	/** Recurrence id (unix time) of the edited occurrence, `null` if the event does not recur */
	eventRecurrenceId: number | null
	/** Id of the calendar selected in the editor, the event is moved to it on save */
	calendarId: string | null
	/** Whether the event is new, also after duplicating an event */
	isNew: boolean
	/**
	 * Whether the event is loading, saving or ready to be edited,
	 * or whether loading it failed and the editor shows an error instead.
	 */
	status: 'loading' | 'saving' | 'ready' | 'error'
	/** How the editor is shown: the popover viewing or editing the event, or the full editor */
	view: 'preview' | 'simple' | 'full'
	/** Whether the editor is visible, e.g. the popover is hidden after changing the view of the calendar */
	isVisible: boolean
	/** Whether the event cannot be modified, e.g. because of the permissions of its calendar */
	isReadOnly: boolean
	/** Whether the editor is shown in a widget, e.g. on the dashboard */
	isWidget: boolean
	/** Whether the editor is shown in a standalone dialog, e.g. from the app menu */
	isDialog: boolean
}

/**
 * Whether two editor states are for the same event.
 *
 * @param a - An editor state
 * @param b - Another editor state
 * @return Whether the same occurrence of the same event is edited in both
 */
export function isSameEvent(a: EventEditorState, b: EventEditorState): boolean {
	return a.eventId === b.eventId
		&& a.eventRecurrenceId === b.eventRecurrenceId
		// A new event gets its id when it is saved.
		&& (a.calendarObjectId === null || b.calendarObjectId === null || a.calendarObjectId === b.calendarObjectId)
}

/**
 * Get the state of the editor the extensions are set up in.
 *
 * @param state - The reported state of the editor
 * @return The state, or `null` if no event is shown, e.g. because loading it failed
 */
export function toOpenEditorState(state: EventEditorState | null): Readonly<EventEditorState> | null {
	if (!state || state.status === 'error') {
		return null
	}
	return Object.freeze({ ...state })
}

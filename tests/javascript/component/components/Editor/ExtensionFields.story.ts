/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { App, PropType } from 'vue'
import type { EventEditorView } from '@/store/eventEditorExtensionInstances'

import { registerEventEditorExtension } from '@nextcloud/calendar'
import { translate, translatePlural } from '@nextcloud/l10n'
import { createPinia } from 'pinia'
import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import EditFull from '@/views/EditFull.vue'
import EditSimple from '@/views/EditSimple.vue'
import { getDefaultCalendarObject } from '@/models/calendar.js'
import useCalendarObjectsStore from '@/store/calendarObjects.js'
import useCalendarsStore from '@/store/calendars.js'
import useSettingsStore from '@/store/settings.js'

import '@/styles/editor.scss'

registerEventEditorExtension({
	app: 'calendar_component_tests',
	name: 'field',
	setup({ editor }) {
		// The borders and the cross spanning the icon show in screenshots how the editor lays out the icon and the field.
		const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		icon.setAttribute('viewBox', '0 0 20 20')
		icon.setAttribute('width', '20')
		icon.setAttribute('height', '20')
		icon.innerHTML = '<path d="M0 0L20 20M20 0L0 20" stroke="red" stroke-width="1" />'
		icon.style.boxSizing = 'border-box'
		icon.style.border = '1px solid blue'

		const field = document.createElement('div')
		field.textContent = 'Field of the event editor extension'
		field.style.border = '1px solid blue'

		editor.addField({ icon, field })
	},
})

const CALENDAR_ID = 'calendar'
const OBJECT_ID = 'object'
const START = Date.UTC(2026, 0, 15, 10) / 1000
const END = START + 60 * 60

/**
 * Set up an app with the stores and the router the editors need,
 * like `main.js` and `Calendar.vue` do for the calendar app.
 *
 * @param isReadOnly Whether the calendar of the event is read-only
 */
async function createEditorApp(isReadOnly: boolean): Promise<App> {
	const app = createApp({ render: () => h(RouterView) })
	app.config.globalProperties.$t = translate
	app.config.globalProperties.$n = translatePlural
	app.config.globalProperties.t = translate
	app.config.globalProperties.n = translatePlural

	const pinia = createPinia()
	app.use(pinia)

	const settingsStore = useSettingsStore(pinia)
	settingsStore.timezone = 'UTC'
	settingsStore.initializeCalendarJsConfig()

	const calendarsStore = useCalendarsStore(pinia)
	calendarsStore.addCalendarMutation({
		calendar: getDefaultCalendarObject({
			id: CALENDAR_ID,
			displayName: 'Calendar',
			// The editor shows events read-only based on the permissions only.
			// Not marked as read-only, which would exclude the calendar from the ones new events are created in.
			readOnly: false,
			canCreateObject: !isReadOnly,
			canModifyObject: !isReadOnly,
			canDeleteObject: !isReadOnly,
		}),
	})
	calendarsStore.initialCalendarsLoaded = true

	// An event as if it was loaded from the server.
	const calendarObjectsStore = useCalendarObjectsStore(pinia)
	const calendarObject = await calendarObjectsStore.createNewEvent({
		start: START,
		end: END,
		timezoneId: 'UTC',
		isAllDay: false,
		calendarId: CALENDAR_ID,
	})
	const eventComponent = calendarObject.calendarComponent.getFirstComponent('VEVENT')
	eventComponent.title = 'Event'
	eventComponent.location = 'Meeting room'
	eventComponent.undirtify()
	calendarObject.id = OBJECT_ID
	calendarObject.dav = { url: `/remote.php/dav/calendars/user/calendar/${OBJECT_ID}.ics` }
	calendarObject.existsOnServer = true
	calendarObjectsStore.appendCalendarObjectMutation({ calendarObject })

	const router = createRouter({
		history: createMemoryHistory(),
		routes: [
			{ path: '/', component: { render: () => null } },
			{ path: '/new/popover/:allDay/:dtstart/:dtend', name: 'NewPopoverView', component: EditSimple },
			{ path: '/edit/popover/:object/:recurrenceId', name: 'EditPopoverView', component: EditSimple },
			{ path: '/edit/full/:object/:recurrenceId', name: 'EditFullView', component: EditFull },
		],
	})
	app.use(router)

	return app
}

/**
 * Get the route to open the editor at.
 *
 * @param view How the editor is shown
 */
function getEditorRoute(view: EventEditorView): string {
	const existingEvent = `${OBJECT_ID}/${START}`
	switch (view) {
		case 'preview':
			return `/edit/popover/${existingEvent}`
		case 'simple':
			// Existing events open in the preview, and the simple view only shows them after clicking "Edit",
			// which a read-only calendar does not offer. A new event shows the simple view right away,
			// and is read-only if its calendar is.
			return `/new/popover/0/${START}/${END}`
		case 'full':
			return `/edit/full/${existingEvent}`
	}
}

/**
 * The editor with the field of an event editor extension.
 * Both editors render outside the story, the popover is appended to the body and the full editor is a modal.
 */
export const Default = defineComponent({
	props: {
		view: {
			type: String as PropType<EventEditorView>,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			default: false,
		},
	},

	setup(props) {
		const container = ref<HTMLElement | null>(null)
		let app: App | undefined

		onMounted(async () => {
			app = await createEditorApp(props.isReadOnly)
			const router = app.config.globalProperties.$router
			await router.push(getEditorRoute(props.view))
			app.mount(container.value!)
		})

		onBeforeUnmount(() => {
			app?.unmount()
		})

		return () => h('div', { ref: container })
	},
})

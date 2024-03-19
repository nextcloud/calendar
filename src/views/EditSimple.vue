<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<Popover ref="popover"
		:shown="showPopover"
		:auto-hide="false"
		:placement="placement"
		:boundary="boundaryElement"
		popover-base-class="event-popover"
		:triggers="[]">
		<div class="event-popover__inner">
			<template v-if="isLoading && !isSaving">
				<PopoverLoadingIndicator />
			</template>

			<template v-else-if="isError">
				<div class="event-popover__top-right-actions">
					<Actions>
						<ActionButton @click="cancel">
							<template #icon>
								<Close :size="20" decorative />
							</template>
							{{ $t('calendar', 'Close') }}
						</ActionButton>
					</Actions>
				</div>

				<EmptyContent :name="$t('calendar', 'Event does not exist')" :description="error">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
				</EmptyContent>
			</template>

			<template v-else>
				<div class="event-popover__top-right-actions">
					<Actions v-if="!isLoading && !isError && !isNew" :force-menu="true">
						<ActionLink v-if="!hideEventExport && hasDownloadURL"
							:href="downloadURL">
							<template #icon>
								<Download :size="20" decorative />
							</template>
							{{ $t('calendar', 'Export') }}
						</ActionLink>
						<ActionButton v-if="!canCreateRecurrenceException && !isReadOnly" @click="duplicateEvent()">
							<template #icon>
								<ContentDuplicate :size="20" decorative />
							</template>
							{{ $t('calendar', 'Duplicate') }}
						</ActionButton>
						<ActionButton v-if="canDelete && !canCreateRecurrenceException" @click="deleteAndLeave(false)">
							<template #icon>
								<Delete :size="20" decorative />
							</template>
							{{ $t('calendar', 'Delete') }}
						</ActionButton>
						<ActionButton v-if="canDelete && canCreateRecurrenceException" @click="deleteAndLeave(false)">
							<template #icon>
								<Delete :size="20" decorative />
							</template>
							{{ $t('calendar', 'Delete this occurrence') }}
						</ActionButton>
						<ActionButton v-if="canDelete && canCreateRecurrenceException" @click="deleteAndLeave(true)">
							<template #icon>
								<Delete :size="20" decorative />
							</template>
							{{ $t('calendar', 'Delete this and all future') }}
						</ActionButton>
					</Actions>
					<Actions>
						<ActionButton @click="cancel">
							<template #icon>
								<Close :size="20" decorative />
							</template>
							{{ $t('calendar', 'Close') }}
						</ActionButton>
					</Actions>
				</div>

				<CalendarPickerHeader :value="selectedCalendar"
					:calendars="calendars"
					:is-read-only="isReadOnlyOrViewing || !canModifyCalendar"
					@update:value="changeCalendar" />

				<PropertyTitle :value="title"
					:is-read-only="isReadOnlyOrViewing"
					@update:value="updateTitle" />

				<PropertyTitleTimePicker :start-date="startDate"
					:start-timezone="startTimezone"
					:end-date="endDate"
					:end-timezone="endTimezone"
					:is-all-day="isAllDay"
					:is-read-only="isReadOnlyOrViewing"
					:can-modify-all-day="canModifyAllDay"
					:user-timezone="currentUserTimezone"
					@update-start-date="updateStartDate"
					@update-start-timezone="updateStartTimezone"
					@update-end-date="updateEndDate"
					@update-end-timezone="updateEndTimezone"
					@toggle-all-day="toggleAllDay" />

				<PropertyText :is-read-only="isReadOnlyOrViewing"
					:prop-model="rfcProps.location"
					:value="location"
					:linkify-links="true"
					@update:value="updateLocation" />
				<PropertyText :is-read-only="isReadOnlyOrViewing"
					:prop-model="rfcProps.description"
					:value="description"
					:linkify-links="true"
					@update:value="updateDescription" />

				<InviteesList class="event-popover__invitees"
					:hide-if-empty="true"
					:hide-buttons="true"
					:hide-errors="true"
					:show-header="true"
					:is-read-only="isReadOnlyOrViewing"
					:is-shared-with-me="isSharedWithMe"
					:calendar-object-instance="calendarObjectInstance"
					:limit="3" />

				<InvitationResponseButtons v-if="isViewedByAttendee && isViewing"
					class="event-popover__response-buttons"
					:attendee="userAsAttendee"
					:calendar-id="calendarId"
					@close="closeEditorAndSkipAction" />

				<SaveButtons v-if="!isWidget"
					class="event-popover__buttons"
					:can-create-recurrence-exception="canCreateRecurrenceException"
					:is-new="isNew"
					:is-read-only="isReadOnlyOrViewing"
					:force-this-and-all-future="forceThisAndAllFuture"
					:show-more-button="true"
					:more-button-type="isViewing ? 'tertiary' : undefined"
					:grow-horizontally="!isViewing && canCreateRecurrenceException"
					:disabled="isSaving"
					@save-this-only="saveAndView(false)"
					@save-this-and-all-future="saveAndView(true)"
					@show-more="showMore">
					<NcButton v-if="!isReadOnly && isViewing"
						:type="isViewedByAttendee ? 'tertiary' : undefined"
						@click="isViewing = false">
						<template #icon>
							<EditIcon :size="20" />
						</template>
						{{ $t('calendar', 'Edit') }}
					</NcButton>
				</SaveButtons>
			</template>
		</div>
	</Popover>
</template>
<script>
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcEmptyContent as EmptyContent,
	NcPopover as Popover,
	NcButton,
} from '@nextcloud/vue'
import EditorMixin from '../mixins/EditorMixin.js'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle.vue'
import PropertyTitleTimePicker
	from '../components/Editor/Properties/PropertyTitleTimePicker.vue'
import PropertyText from '../components/Editor/Properties/PropertyText.vue'
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PopoverLoadingIndicator
	from '../components/Popover/PopoverLoadingIndicator.vue'
import { getPrefixedRoute } from '../utils/router.js'
import InvitationResponseButtons
	from '../components/Editor/InvitationResponseButtons.vue'
import CalendarPickerHeader from '../components/Editor/CalendarPickerHeader.vue'
import InviteesList from '../components/Editor/Invitees/InviteesList.vue'

import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import Close from 'vue-material-design-icons/Close.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Download from 'vue-material-design-icons/Download.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import { mapState } from 'vuex'

export default {
	name: 'EditSimple',
	components: {
		PopoverLoadingIndicator,
		SaveButtons,
		PropertyText,
		PropertyTitleTimePicker,
		PropertyTitle,
		Popover,
		Actions,
		ActionButton,
		ActionLink,
		EmptyContent,
		CalendarBlank,
		Close,
		Download,
		ContentDuplicate,
		Delete,
		InvitationResponseButtons,
		CalendarPickerHeader,
		InviteesList,
		NcButton,
		EditIcon,
	},
	mixins: [
		EditorMixin,
	],
	data() {
		return {
			placement: 'auto',
			hasLocation: false,
			hasDescription: false,
			boundaryElement: null,
			isVisible: true,
			isViewing: true,
		}
	},
	computed: {
		...mapState({
			hideEventExport: (state) => state.settings.hideEventExport,
			widgetEventDetailsOpen: (state) => state.calendars.widgetEventDetailsOpen,
			widgetEventDetails: (state) => state.calendars.widgetEventDetails,
			widgetRef: (state) => state.calendars.widgetRef,
		}),

		showPopover() {
			return this.isVisible || this.widgetEventDetailsOpen
		},

		/**
		 * Returns true if the current event is read only or the user is viewing the event
		 *
		 * @return {boolean}
		 */
		isReadOnlyOrViewing() {
			return this.isReadOnly || this.isViewing || this.isWidget
		},
	},
	watch: {
		$route(to, from) {
			this.repositionPopover()

			// Hide popover when changing the view until the user selects a slot again
			this.isVisible = to?.params.view === from?.params.view
		},
		calendarObjectInstance() {
			this.hasLocation = false
			this.hasDescription = false

			if (typeof this.calendarObjectInstance.location === 'string' && this.calendarObjectInstance.location.trim() !== '') {
				this.hasLocation = true
			}
			if (typeof this.calendarObjectInstance.description === 'string' && this.calendarObjectInstance.description.trim() !== '') {
				this.hasDescription = true
			}
		},
		isNew: {
			immediate: true,
			handler(isNew) {
				// New events should be editable from the start
				this.isViewing = !isNew
			},
		},
	},
	async mounted() {
		if (this.isWidget) {
			const objectId = this.widgetEventDetails.object
			const recurrenceId = this.widgetEventDetails.recurrenceId
			await this.$store.dispatch('getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId, recurrenceId })
			this.calendarId = this.calendarObject.calendarId
			this.isLoading = false
		}
		this.boundaryElement = this.isWidget ? document.querySelector('.fc') : document.querySelector('#app-content-vue > .fc')
		window.addEventListener('keydown', this.keyboardCloseEditor)
		window.addEventListener('keydown', this.keyboardSaveEvent)
		window.addEventListener('keydown', this.keyboardDeleteEvent)
		window.addEventListener('keydown', this.keyboardDuplicateEvent)

		this.$nextTick(() => {
			this.repositionPopover()
		})
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.keyboardCloseEditor)
		window.removeEventListener('keydown', this.keyboardSaveEvent)
		window.removeEventListener('keydown', this.keyboardDeleteEvent)
		window.removeEventListener('keydown', this.keyboardDuplicateEvent)
	},
	methods: {
		showMore() {
			// Do not save yet
			this.requiresActionOnRouteLeave = false

			const params = Object.assign({}, this.$route.params)
			if (this.isNew) {
				this.$router.push({ name: 'NewSidebarView', params })
			} else {
				this.$router.push({
					name: getPrefixedRoute(this.$route.name, 'EditSidebarView'),
					params,
				})
			}
		},
		getDomElementForPopover(isNew, route) {
			let matchingDomObject
			if (this.isWidget) {
				const objectId = this.widgetEventDetails.object
				const recurrenceId = this.widgetEventDetails.recurrenceId

				matchingDomObject = this.widgetRef.querySelector(`.fc-event[data-object-id="${objectId}"][data-recurrence-id="${recurrenceId}"]`)
				this.placement = 'auto'
			} else if (isNew) {
				matchingDomObject = document.querySelector('.fc-highlight')
				this.placement = 'auto'

				if (!matchingDomObject) {
					matchingDomObject = document.querySelector('.fc-event[data-is-new="yes"]')
				}
			} else {
				const objectId = route.params.object
				const recurrenceId = route.params.recurrenceId

				matchingDomObject = document.querySelector(`.fc-event[data-object-id="${objectId}"][data-recurrence-id="${recurrenceId}"]`)
				this.placement = 'auto'
			}

			if (!matchingDomObject) {
				matchingDomObject = document.querySelector('#app-navigation-vue')
				this.placement = 'right'
			}

			if (!matchingDomObject) {
				matchingDomObject = document.querySelector('body')
				this.placement = 'auto'
			}

			console.info('getDomElementForPopover', matchingDomObject, this.placement)
			return matchingDomObject
		},
		repositionPopover() {
		  const isNew = this.isWidget ? false : this.$route.name === 'NewPopoverView'
		  this.$refs.popover.$children[0].$refs.reference = this.getDomElementForPopover(isNew, this.$route)
		  this.$refs.popover.$children[0].$refs.popper.dispose()
		  this.$refs.popover.$children[0].$refs.popper.init()
		},
		/**
		 * Save changes and return to viewing mode or stay in editing mode if an error occurrs
		 *
		 * @param {boolean} thisAndAllFuture Modify this and all future events
		 * @return {Promise<void>}
		 */
		async saveAndView(thisAndAllFuture) {
			this.isViewing = true
			try {
				await this.save(thisAndAllFuture)
				this.requiresActionOnRouteLeave = false
			} catch (error) {
				this.isViewing = false
			}
		},
	},
}
</script>

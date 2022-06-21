<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license GNU AGPL version 3 or any later version
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
		:open="isVisible"
		:auto-hide="false"
		:placement="placement"
		:boundaries-element="boundaryElement"
		open-class="event-popover"
		trigger="manual">
		<template v-if="isLoading">
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

			<EmptyContent>
				{{ $t('calendar', 'Event does not exist') }}
				<template #icon>
					<CalendarBlank :size="20" decorative />
				</template>
				<template #desc>
					{{ error }}
				</template>
			</EmptyContent>
		</template>

		<template v-else>
			<div class="event-popover__top-right-actions">
				<Actions v-if="isReadOnly">
					<ActionButton @click="showMore">
						<template #icon>
							<ArrowExpand :size="20" decorative />
						</template>
						{{ $t('calendar', 'Show more details') }}
					</ActionButton>
				</Actions>
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

			<IllustrationHeader :color="illustrationColor"
				:illustration-url="backgroundImage" />

			<PropertyTitle :value="title"
				:is-read-only="isReadOnly"
				@update:value="updateTitle" />

			<PropertyCalendarPicker v-if="showCalendarPicker"
				:calendars="calendars"
				:calendar="selectedCalendar"
				:is-read-only="isReadOnly"
				@select-calendar="changeCalendar" />

			<PropertyTitleTimePicker :start-date="startDate"
				:start-timezone="startTimezone"
				:end-date="endDate"
				:end-timezone="endTimezone"
				:is-all-day="isAllDay"
				:is-read-only="isReadOnly"
				:can-modify-all-day="canModifyAllDay"
				:user-timezone="currentUserTimezone"
				@update-start-date="updateStartDate"
				@update-start-timezone="updateStartTimezone"
				@update-end-date="updateEndDate"
				@update-end-timezone="updateEndTimezone"
				@toggle-all-day="toggleAllDay" />

			<PropertyText :is-read-only="isReadOnly"
				:prop-model="rfcProps.location"
				:value="location"
				@update:value="updateLocation" />
			<PropertyText :is-read-only="isReadOnly"
				:prop-model="rfcProps.description"
				:value="description"
				@update:value="updateDescription" />

			<InvitationResponseButtons v-if="isViewedByAttendee && userAsAttendee && !isReadOnly"
				:attendee="userAsAttendee"
				:calendar-id="calendarId"
				@close="closeEditorAndSkipAction" />

			<SaveButtons v-if="!isReadOnly"
				class="event-popover__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				:show-more-button="true"
				@save-this-only="saveAndLeave(false)"
				@save-this-and-all-future="saveAndLeave(true)"
				@show-more="showMore" />
		</template>
	</Popover>
</template>
<script>
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import Popover from '@nextcloud/vue/dist/Components/Popover'
import EditorMixin from '../mixins/EditorMixin'
import IllustrationHeader from '../components/Editor/IllustrationHeader.vue'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle.vue'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker.vue'
import PropertyCalendarPicker from '../components/Editor/Properties/PropertyCalendarPicker.vue'
import PropertyText from '../components/Editor/Properties/PropertyText.vue'
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PopoverLoadingIndicator from '../components/Popover/PopoverLoadingIndicator.vue'
import { getPrefixedRoute } from '../utils/router.js'
import InvitationResponseButtons from '../components/Editor/InvitationResponseButtons'

import ArrowExpand from 'vue-material-design-icons/ArrowExpand.vue'
import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import Close from 'vue-material-design-icons/Close.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Download from 'vue-material-design-icons/Download.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'
import { mapState } from 'vuex'

export default {
	name: 'EditSimple',
	components: {
		PopoverLoadingIndicator,
		SaveButtons,
		PropertyText,
		PropertyCalendarPicker,
		PropertyTitleTimePicker,
		PropertyTitle,
		IllustrationHeader,
		Popover,
		Actions,
		ActionButton,
		ActionLink,
		EmptyContent,
		ArrowExpand,
		CalendarBlank,
		Close,
		Download,
		ContentDuplicate,
		Delete,
		InvitationResponseButtons,
	},
	mixins: [
		EditorMixin,
	],
	computed: {
	  ...mapState({
		  hideEventExport: (state) => state.settings.hideEventExport,
	  }),
	},
	data() {
		return {
			placement: 'auto',
			hasLocation: false,
			hasDescription: false,
			boundaryElement: document.querySelector('#app-content > .fc'),
			isVisible: true,
		}
	},
	watch: {
		$route(to, from) {
			// Update the popover position by updating its reference element.
			const isNew = to.name === 'NewPopoverView'
			const popover = this.$refs.popover.$children[0]
			popover.$_updatePopper(() => {
				popover.popperInstance.reference = this.getDomElementForPopover(isNew, to)
			})

			// Hide popover when changing the view until the user selects a slot again
			this.isVisible = to.params.view === from.params.view
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
	},
	mounted() {
		window.addEventListener('keydown', this.keyboardCloseEditor)
		window.addEventListener('keydown', this.keyboardSaveEvent)
		window.addEventListener('keydown', this.keyboardDeleteEvent)
		window.addEventListener('keydown', this.keyboardDuplicateEvent)
		this.$nextTick(() => {
			const isNew = this.$route.name === 'NewPopoverView'

			// V3 of V-Tooltip will have a prop to define the reference element for popper.js
			// For now we have to stick to this ugly hack
			// https://github.com/Akryum/v-tooltip/issues/60
			this.$refs.popover
				.$children[0]
				.$refs.trigger = this.getDomElementForPopover(isNew, this.$route)
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
			if (this.$route.name === 'NewPopoverView') {
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

			if (isNew) {
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
				matchingDomObject = document.querySelector('#app-navigation')
				this.placement = 'right'
			}

			if (!matchingDomObject) {
				matchingDomObject = document.querySelector('body')
				this.placement = 'auto'
			}

			return matchingDomObject
		},
	},
}
</script>

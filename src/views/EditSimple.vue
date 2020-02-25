<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
	<Popover
		ref="popover"
		:open="isOpen"
		:auto-hide="false"
		:placement="placement"
		boundaries-element="#app-content"
		open-class="event-popover"
		trigger="manual">
		<PopoverLoadingIndicator
			v-if="isLoading" />

		<div class="event-popover__top-right-actions">
			<Actions v-if="!isLoading && isReadOnly">
				<ActionButton
					icon="icon-fullscreen"
					@click="showMore">
					{{ $t('calendar', 'Show more details') }}
				</ActionButton>
			</Actions>
			<Actions v-if="!isLoading">
				<ActionButton
					icon="icon-close"
					@click="cancel">
					{{ $t('calendar', 'Close') }}
				</ActionButton>
			</Actions>
		</div>

		<IllustrationHeader
			v-if="!isLoading"
			:color="illustrationColor"
			:illustration-url="backgroundImage" />

		<PropertyTitle
			v-if="!isLoading"
			:value="title"
			:is-read-only="isReadOnly"
			@update:value="updateTitle" />

		<PropertyTitleTimePicker
			v-if="!isLoading"
			:start-date="startDate"
			:start-timezone="startTimezone"
			:end-date="endDate"
			:end-timezone="endTimezone"
			:is-all-day="isAllDay"
			:is-read-only="isReadOnly"
			:can-modify-all-day="canModifyAllDay"
			:user-timezone="currentUserTimezone"
			@updateStartDate="updateStartDate"
			@updateStartTimezone="updateStartTimezone"
			@updateEndDate="updateEndDate"
			@updateEndTimezone="updateEndTimezone"
			@toggleAllDay="toggleAllDay" />

		<PropertyCalendarPicker
			v-if="!isLoading && showCalendarPicker"
			:calendars="calendars"
			:calendar="selectedCalendar"
			:is-read-only="isReadOnly"
			@selectCalendar="changeCalendar" />

		<PropertyText
			v-if="!isLoading && hasLocation"
			:is-read-only="isReadOnly"
			:prop-model="rfcProps.location"
			:value="location"
			@update:value="updateLocation" />
		<PropertyText
			v-if="!isLoading && hasDescription"
			:is-read-only="isReadOnly"
			:prop-model="rfcProps.description"
			:value="description"
			@update:value="updateDescription" />

		<SaveButtons
			v-if="!isLoading && !isReadOnly"
			class="event-popover__buttons"
			:can-create-recurrence-exception="canCreateRecurrenceException"
			:is-new="isNew"
			:force-this-and-all-future="forceThisAndAllFuture"
			:show-more-button="true"
			@saveThisOnly="saveAndLeave(false)"
			@saveThisAndAllFuture="saveAndLeave(true)"
			@showMore="showMore" />
	</Popover>
</template>
<script>
import { Actions } from '@nextcloud/vue/dist/Components/Actions'
import { ActionButton } from '@nextcloud/vue/dist/Components/ActionButton'
import { Popover } from '@nextcloud/vue/dist/Components/Popover'
import EditorMixin from '../mixins/EditorMixin'
import IllustrationHeader from '../components/Editor/IllustrationHeader.vue'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle.vue'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker.vue'
import PropertyCalendarPicker from '../components/Editor/Properties/PropertyCalendarPicker.vue'
import PropertyText from '../components/Editor/Properties/PropertyText.vue'
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PopoverLoadingIndicator from '../components/Popover/PopoverLoadingIndicator.vue'
import { getPrefixedRoute } from '../utils/router.js'

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
	},
	mixins: [
		EditorMixin,
	],
	data() {
		return {
			placement: 'auto',
			isOpen: false,
			hasLocation: false,
			hasDescription: false,
		}
	},
	watch: {
		eventComponent() {
			const isNew = this.$route.name === 'NewPopoverView'
			this.$refs.popover
				.$children[0]
				.$refs.trigger = this.getDomElementForPopover(isNew, this.$route)
			this.$refs.popover
				.$children[0]
				.$_restartPopper()
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
		this.$nextTick(() => {
			const isNew = this.$route.name === 'NewPopoverView'

			// TODO: test beforeRouteUpdate

			// V3 of V-Tooltip will have a prop to define the reference element for popper.js
			// For now we have to stick to this ugly hack
			// https://github.com/Akryum/v-tooltip/issues/60
			this.$refs.popover
				.$children[0]
				.$refs.trigger = this.getDomElementForPopover(isNew, this.$route)
			this.isOpen = true
		})
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
					matchingDomObject = document.querySelector(`.fc-event[data-is-new="yes"]`)
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
	beforeRouteUpdate(to, from, next) {
		const isNew = to.name === 'NewPopoverView'
		this.$refs.popover
			.$children[0]
			.$refs.trigger = this.getDomElementForPopover(isNew, to)
		this.$refs.popover
			.$children[0]
			.$_restartPopper()

		next()
	},
}
</script>

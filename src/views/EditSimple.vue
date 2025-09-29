<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<div
			v-if="showPopover && !isViewing"
			ref="mask"
			class="modal-mask"
			:class="{
				'modal-mask--opaque': dark,
				'modal-mask--light': lightBackdrop,
			}"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			@click.self="cancel(false)" />
		<NcPopover
			ref="popover"
			:shown="showPopover"
			:auto-hide="false"
			:placement="placement"
			popover-base-class="event-popover"
			:triggers="[]">
			
			<div class="event-popover__inner edit-simple">
				   <template v-if="isLoading && !isSaving">
					   <PopoverLoadingIndicator />
					   <div class="event-popover__top-actions">
						   <NcActions>
							   <NcActionButton @click="cancel(false)">
								   <template #icon>
									   <Close :size="20" decorative />
								   </template>
								   {{ $t('calendar', 'Close') }}
							   </NcActionButton>
						   </NcActions>
					   </div>
				   </template>

				<template v-else-if="isError">
					<div :class="topActionsClass">
						<NcActions>
							<NcActionButton @click="cancel(false)">
								<template #icon>
									<Close :size="20" decorative />
								</template>
								{{ $t('calendar', 'Close') }}
							</NcActionButton>
						</NcActions>
					</div>

					<EmptyContent :name="$t('calendar', 'Event does not exist')" :description="error">
						<template #icon>
							<CalendarBlank :size="20" decorative />
						</template>
					</EmptyContent>
				</template>

				<template v-else>
					<div class="event-popover__top-actions">
						<NcPopover v-if="isViewedByOrganizer === false" :no-focus-trap="true">
							<template #trigger>
								<NcButton variant="tertiary-no-background">
									<template #icon>
										<HelpCircleIcon :size="20" />
									</template>
								</NcButton>
							</template>
							<template #default>
								<p class="warning-text">
									{{ $t('calendar', 'Modifications will not get propagated to the organizer and other attendees') }}
								</p>
							</template>
						</NcPopover>
						<NcActions v-if="!isLoading && !isError && !isNew" :force-menu="true">
							<NcActionLink
								v-if="!hideEventExport && hasDownloadURL"
								:href="downloadURL">
								<template #icon>
									<Download :size="20" decorative />
								</template>
								{{ $t('calendar', 'Export') }}
							</NcActionLink>
							<NcActionButton v-if="!canCreateRecurrenceException && !isReadOnly" @click="duplicateEvent()">
								<template #icon>
									<ContentDuplicate :size="20" decorative />
								</template>
								{{ $t('calendar', 'Duplicate') }}
							</NcActionButton>
							<NcActionButton v-if="canDelete && !canCreateRecurrenceException" @click="deleteAndLeave(false)">
								<template #icon>
									<Delete :size="20" decorative />
								</template>
								{{ $t('calendar', 'Delete') }}
							</NcActionButton>
							<NcActionButton v-if="canDelete && canCreateRecurrenceException" @click="deleteAndLeave(false)">
								<template #icon>
									<Delete :size="20" decorative />
								</template>
								{{ $t('calendar', 'Delete this occurrence') }}
							</NcActionButton>
							<NcActionButton v-if="canDelete && canCreateRecurrenceException" @click="deleteAndLeave(true)">
								<template #icon>
									<Delete :size="20" decorative />
								</template>
								{{ $t('calendar', 'Delete this and all future') }}
							</NcActionButton>
						</NcActions>
						<NcActions>
							<NcActionButton @click="cancel(false)">
								<template #icon>
									<Close :size="20" decorative />
								</template>
								{{ $t('calendar', 'Close') }}
							</NcActionButton>
						</NcActions>
					</div>

					<CalendarPickerHeader
						:value="selectedCalendar"
						:calendars="calendars"
						:is-read-only="isReadOnlyOrViewing || !canModifyCalendar"
						:is-viewed-by-attendee="isViewedByOrganizer === false"
						@update:value="changeCalendar" />

					<PropertyTitle
						:value="titleOrPlaceholder"
						:is-read-only="isReadOnlyOrViewing || isViewedByOrganizer === false"
						@update:value="updateTitle" />

					<PropertyTitleTimePicker
						:start-date="startDate"
						:start-timezone="startTimezone"
						:end-date="endDate"
						:end-timezone="endTimezone"
						:is-all-day="isAllDay"
						:is-read-only="isReadOnlyOrViewing || isViewedByOrganizer === false"
						:can-modify-all-day="canModifyAllDay"
						:user-timezone="currentUserTimezone"
						:wrap="false"
						@update-start-date="updateStartDate"
						@update-start-time="updateStartTime"
						@update-start-timezone="updateStartTimezone"
						@update-end-date="updateEndDate"
						@update-end-time="updateEndTime"
						@update-end-timezone="updateEndTimezone"
						@toggle-all-day="toggleAllDay" />

					<div v-if="!isReadOnlyOrViewing" class="app-full__header__details">
						<div class="app-full__header__details-time">
							<NcCheckboxRadioSwitch
								:model-value="isAllDay"
								:disabled="!canModifyAllDay"
								@update:modelValue="toggleAllDayPreliminary">
								{{ $t('calendar', 'All day') }}
							</NcCheckboxRadioSwitch>
						</div>
					</div>

					<PropertyText
						:is-read-only="isReadOnlyOrViewing || isViewedByOrganizer === false"
						:prop-model="rfcProps.location"
						:value="location"
						:linkify-links="true"
						@update:value="updateLocation" />
					<PropertyText
						:is-read-only="isReadOnlyOrViewing"
						:prop-model="rfcProps.description"
						:value="description"
						:linkify-links="true"
						:is-description="true"
						@update:value="updateDescription" />

					<InviteesList
						v-if="!isViewing || (isViewing && hasAttendees)"
						class="event-popover__invitees"
						:hide-buttons="true"
						:hide-errors="true"
						:show-header="true"
						:is-read-only="isReadOnlyOrViewing || isViewedByOrganizer === false"
						:is-shared-with-me="isSharedWithMe"
						:calendar="selectedCalendar"
						:calendar-object-instance="calendarObjectInstance"
						:limit="3" />

					<InvitationResponseButtons
						v-if="isViewedByAttendee && isViewing"
						class="event-popover__response-buttons"
						:attendee="userAsAttendee"
						:calendar-id="calendarId"
						@close="closeEditorAndSkipAction" />

					<NcAppNavigationSpacer />

					<SaveButtons
						v-if="!isWidget"
						class="event-popover__buttons"
						:can-create-recurrence-exception="canCreateRecurrenceException"
						:is-new="isNew"
						:is-read-only="isReadOnlyOrViewing"
						:force-this-and-all-future="forceThisAndAllFuture"
						:show-more-button="true"
						:more-button-type="isViewing ? 'tertiary' : undefined"
						:disabled="isSaving"
						@save-this-only="saveAndView(false)"
						@save-this-and-all-future="saveAndView(true)"
						@show-more="showMore">
						<NcButton
							v-if="!isReadOnly && isViewing"
							:variant="isViewedByAttendee ? 'tertiary' : undefined"
							@click="isViewing = false">
							<template #icon>
								<EditIcon :size="20" />
							</template>
							{{ $t('calendar', 'Edit') }}
						</NcButton>
					</SaveButtons>
				</template>
			</div>
		</ncpopover>
		<NcDialog
			:open="showCancelDialog"
			class="cancel-confirmation-dialog"
			:name="t('calendar', 'Discard changes?')"
			:message="t('calendar', 'Are you sure you want to discard the changes made to this event?')"
			:buttons="cancelButtons" />
	</div>
</template>

<script>
import IconCancel from '@mdi/svg/svg/cancel.svg?raw'
import IconDelete from '@mdi/svg/svg/delete.svg?raw'
import {
	NcActionButton,
	NcActionLink,
	NcActions,
	NcEmptyContent as EmptyContent,
	NcAppNavigationSpacer,
	NcButton,
	NcCheckboxRadioSwitch, NcDialog,
	NcPopover,
} from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import CalendarBlank from 'vue-material-design-icons/CalendarBlankOutline.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'
import HelpCircleIcon from 'vue-material-design-icons/HelpCircleOutline.vue'
import EditIcon from 'vue-material-design-icons/PencilOutline.vue'
import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import Download from 'vue-material-design-icons/TrayArrowDown.vue'
import CalendarPickerHeader from '../components/Editor/CalendarPickerHeader.vue'
import InvitationResponseButtons
	from '../components/Editor/InvitationResponseButtons.vue'
import InviteesList from '../components/Editor/Invitees/InviteesList.vue'
import PropertyText from '../components/Editor/Properties/PropertyText.vue'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle.vue'
import PropertyTitleTimePicker
	from '../components/Editor/Properties/PropertyTitleTimePicker.vue'
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PopoverLoadingIndicator
	from '../components/Popover/PopoverLoadingIndicator.vue'
import EditorMixin from '../mixins/EditorMixin.js'
import useCalendarObjectInstanceStore from '../store/calendarObjectInstance.js'
import useSettingsStore from '../store/settings.js'
import useWidgetStore from '../store/widget.js'
import {
	getPrefixedRoute,
	beforeRouteEnter,
	beforeRouteLeave,
	beforeRouteUpdate,
 } from '@/utils/router.js'

export default {
	name: 'EditSimple',
	components: {
		NcCheckboxRadioSwitch,
		PopoverLoadingIndicator,
		SaveButtons,
		PropertyText,
		PropertyTitleTimePicker,
		PropertyTitle,
		NcPopover,
		NcActions,
		NcActionButton,
		NcActionLink,
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
		HelpCircleIcon,
		NcAppNavigationSpacer,
		NcDialog,
	},

	mixins: [
		EditorMixin,
	],

	props: {
		dark: {
			type: Boolean,
			default: false,
		},

		lightBackdrop: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			placement: 'auto',
			hasLocation: false,
			hasDescription: false,
			hasAttendees: false,
			boundaryElement: null,
			isVisible: true,
			isViewing: true,
			closeMask: false,
			showCancelDialog: false,
			cancelButtons: [
				{
					label: t('calendar', 'Discard event'),
					icon: atob(IconDelete.split(',')[1]),
					callback: () => { this.cancel(true) },
				},
				{
					label: t('calendar', 'Cancel'),
					type: 'primary',
					icon: atob(IconCancel.split(',')[1]),
					callback: () => { this.showCancelDialog = false },
				},
			],
		}
	},

	computed: {
		...mapStores(useCalendarObjectInstanceStore),
		...mapState(useSettingsStore, ['hideEventExport']),
		...mapState(useWidgetStore, [
			'hideEventExport',
			'widgetEventDetailsOpen',
			'widgetEventDetails',
			'widgetRef',
		]),

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

		/**
		 * Return the event's title or a placeholder if it is empty
		 *
		 * @return {string}
		 */
		titleOrPlaceholder() {
			if (this.title === '' && this.isReadOnlyOrViewing && !this.isLoading) {
				return t('calendar', 'Untitled event')
			}

			return this.title
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
			this.hasAttendees = false

			if (typeof this.calendarObjectInstance.location === 'string' && this.calendarObjectInstance.location.trim() !== '') {
				this.hasLocation = true
			}
			if (typeof this.calendarObjectInstance.description === 'string' && this.calendarObjectInstance.description.trim() !== '') {
				this.hasDescription = true
			}
			if (Array.isArray(this.calendarObjectInstance.attendees) && this.calendarObjectInstance.attendees.length > 0) {
				this.hasAttendees = true
			}
		},

		isNew: {
			immediate: true,
			handler(isNew) {
				// New events should be editable from the start
				this.isViewing = !isNew
			},
		},

		isLoading() {
			console.info('isLoading changed', this.isLoading)
		}
	},

	async mounted() {
		if (this.isWidget) {
			const objectId = this.widgetEventDetails.object
			const recurrenceId = this.widgetEventDetails.recurrenceId
			await this.calendarObjectInstanceStore.getCalendarObjectInstanceByObjectIdAndRecurrenceId({ objectId, recurrenceId })
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

	beforeRouteEnter(to, from, next) {
		beforeRouteEnter.call(this, to, from, next)
	},

	beforeRouteUpdate(to, from, next) {
		beforeRouteUpdate.call(this, to, from, next)
	},

	beforeRouteLeave(to, from, next) {
		beforeRouteLeave.call(this, to, from, next)
	},

	beforeDestroy() {
		window.removeEventListener('keydown', this.keyboardCloseEditor)
		window.removeEventListener('keydown', this.keyboardSaveEvent)
		window.removeEventListener('keydown', this.keyboardDeleteEvent)
		window.removeEventListener('keydown', this.keyboardDuplicateEvent)
	},

	methods: {
		closePopover() {
			this.showMask = false
		},

		showMore() {
			// Do not save yet
			this.requiresActionOnRouteLeave = false

			const params = { ...this.$route.params }
			if (this.isNew) {
				this.$router.push({ name: 'NewFullView', params })
			} else {
				this.$router.push({
					name: getPrefixedRoute(this.$route.name, 'EditFullView'),
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
			/*
			const isNew = this.isWidget ? false : this.$route.name === 'NewPopoverView'
			this.$refs.popover.$children[0].$refs.reference = this.getDomElementForPopover(isNew, this.$route)
			this.$refs.popover.$children[0].$refs.popper.dispose()
			this.$refs.popover.$children[0].$refs.popper.init()
			*/
		},

		/**
		 * Save changes and leave when creating a new event or return to viewing mode when editing
		 * an existing event. Stay in editing mode if an error occurrs.
		 *
		 * @param {boolean} thisAndAllFuture Modify this and all future events
		 * @return {Promise<void>}
		 */
		async saveAndView(thisAndAllFuture) {
			// Transitioning from new to edit routes is not implemented for now
			if (this.isNew) {
				await this.saveAndLeave(thisAndAllFuture)
				return
			}

			this.isViewing = true
			try {
				await this.save(thisAndAllFuture)
				this.requiresActionOnRouteLeave = false
			} catch (error) {
				this.isViewing = false
			}
		},

		/**
		 * Toggles the all-day state of an event
		 */
		toggleAllDayPreliminary() {
			if (!this.canModifyAllDay) {
				return
			}

			this.toggleAllDay()
		},
	},
}
</script>

<style lang="scss" scoped>
.event-popover__inner {
	width: unset !important;
	min-width: 500px !important;
	max-height: 90vh !important; // leaving some margin makes scrolling easier and ensures elements aren't cut off
	overflow-y: auto !important;
}

.modal-mask {
	position: fixed;
	z-index: 9998;
	//the height of header
	top: 50px;
	inset-inline-start: 0;
	display: block;
	width: 100%;
	height: 100%;
	--backdrop-color: 0, 0, 0;
	background-color: rgba(var(--backdrop-color), .5);
	&--opaque {
		background-color: rgba(var(--backdrop-color), .92);
	}
	&--light {
		--backdrop-color: 255, 255, 255;
	}
}

.cancel-confirmation-dialog {
	z-index: 1000000 !important;
}

.event-popover .event-popover__inner {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 4);
	text-align: start;
	max-width: 480px;
	width: 480px;
	padding: calc(var(--default-grid-baseline) * 2);
	padding-top: var(--default-grid-baseline);
	.empty-content {
		margin-top: 0 !important;
		padding: calc(var(--default-grid-baseline) * 12);
	}
	.event-popover__invitees {
		.avatar-participation-status__text {
			bottom: 22px;
		}
	}
	.event-popover__buttons {
		margin-top: calc(var(--default-grid-baseline) * 2);
	}
	.event-popover__top-actions {
		display: flex;
		gap: var(--default-grid-baseline);
		position: absolute !important;
		top: var(--default-grid-baseline) !important;
		z-index: 100 !important;
		opacity: .7 !important;
		border-radius: 22px !important;
		align-items: center;
		inset-inline-end : var(--default-grid-baseline) !important;
		.action-item.action-item--single {
			width: 44px !important;
			height: 44px !important;
		}
	}
	.popover-loading-indicator {
		width: 100%;
		&__icon {
			margin: 0 auto;
			height: 62px;
			width: 62px;
			background-size: 62px;
		}
	}

	.event-popover__response-buttons {
		margin-top: calc(var(--default-grid-baseline) * 2);
		margin-bottom: 0;
	}
	.property-text {
		&__icon {
			margin: 0 !important;
		}
	}
}

.event-popover {
	// Don't cut popovers above popovers (e.g. date time picker)
	.v-popper__inner {
		overflow: unset !important;
	}

	&[x-out-of-boundaries] {
		margin-top: 75px;
	}

	.calendar-picker-header {
		margin-inline-start: 0 !important;
	}
}

.event-popover[x-placement^='bottom'] {
	.popover__arrow {
		border-block-end-color: var(--color-background-dark);
	}
}
</style>

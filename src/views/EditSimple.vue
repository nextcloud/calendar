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
		<div
			v-if="showPopover"
			class="event-popover v-popper__popper"
			:style="{ 
				...popoverStyle, 
				pointerEvents: popoverReady ? 'auto' : 'none',
				visibility: popoverReady ? 'visible' : 'hidden',
				opacity: popoverReady ? 1 : 0,
				transition: popoverReady ? 'opacity 0.15s ease' : 'none',
			}">
			<div class="event-popover__inner edit-simple">
					<template v-if="isLoading && !isSaving">
						<PopoverLoadingIndicator />
					</template>

				<template v-else-if="isError">
					<div :class="topActionsClass">
						<Actions>
							<ActionButton @click="cancel(false)">
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
						<Actions v-if="!isLoading && !isError && !isNew" :force-menu="true">
							<ActionLink
								v-if="!hideEventExport && hasDownloadURL"
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
							<ActionButton @click="cancel(false)">
								<template #icon>
									<Close :size="20" decorative />
								</template>
								{{ $t('calendar', 'Close') }}
							</ActionButton>
						</Actions>
					</div>

					<!-- Sticky header with calendar picker and title -->
					<div class="event-popover__header">
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
					</div>

					<!-- Scrollable content area -->
					<div class="event-popover__content">
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
									:checked="isAllDay"
									:disabled="!canModifyAllDay"
									@update:checked="toggleAllDayPreliminary">
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
					</div>

					<!-- Sticky buttons at the bottom -->
					<div class="event-popover__footer">
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
					</div>
				</template>
			</div>
		</div>
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
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcActions as Actions,
	NcEmptyContent as EmptyContent,
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
import { getPrefixedRoute } from '../utils/router.js'

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
		HelpCircleIcon,
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
			popoverStyle: {},
			popoverReady: false,
			resizeTimeout: null,
			popoverResizeObserver: null,
			lastTargetElement: null,
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
			// Hide popover when changing the view until the user selects a slot again
			this.isVisible = to?.params.view === from?.params.view
			
			if (this.isVisible) {
				this.$nextTick(() => {
					this.repositionPopover()
				})
			}
		},

		showPopover(newVal) {
			// Reset popover ready state when closing
			if (!newVal) {
				this.popoverReady = false
			}
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

			// Reposition after content changes
			this.$nextTick(() => {
				this.repositionPopover()
			})
		},

		isNew: {
			immediate: true,
			handler(isNew) {
				// New events should be editable from the start
				this.isViewing = !isNew
			},
		},

		isViewing() {
			// Reposition when switching between viewing and editing modes as the content height may change significantly
			setTimeout(() => {
				this.repositionPopover(true)
			}, 100)
		},
	},

	async mounted() {
		console.debug('[calendar] EditSimple: Initializing popover positioning')
		if (this.isWidget) {
			const objectId = this.widgetEventDetails.object
			const recurrenceId = this.widgetEventDetails.recurrenceId
			await this.calendarObjectInstanceStore.getCalendarObjectInstanceByObjectIdAndRecurrenceId({ objectId, recurrenceId })
			this.calendarId = this.calendarObject.calendarId
			this.isLoading = false
		}
		this.boundaryElement = document.querySelector(".calendar-wrapper")
		window.addEventListener('keydown', this.keyboardCloseEditor)
		window.addEventListener('keydown', this.keyboardSaveEvent)
		window.addEventListener('keydown', this.keyboardDeleteEvent)
		window.addEventListener('keydown', this.keyboardDuplicateEvent)
		window.addEventListener('resize', this.handleResize)

		this.$nextTick(() => {
			this.repositionPopover()
			
			// Set up ResizeObserver to check if popover went out of bounds when content changes
			const popoverEl = document.querySelector('.event-popover.v-popper__popper')
			if (popoverEl && 'ResizeObserver' in window) {
				this.popoverResizeObserver = new ResizeObserver(() => {
					// Debounce the resize events
					if (this.resizeTimeout) {
						clearTimeout(this.resizeTimeout)
					}
					this.resizeTimeout = setTimeout(() => {
						// Only reposition if the popover went out of bounds
						this.adjustPopoverPositionIfNeeded()
					}, 50)
				})
				this.popoverResizeObserver.observe(popoverEl)
			}
		})
	},

	beforeDestroy() {
		window.removeEventListener('keydown', this.keyboardCloseEditor)
		window.removeEventListener('keydown', this.keyboardSaveEvent)
		window.removeEventListener('keydown', this.keyboardDeleteEvent)
		window.removeEventListener('keydown', this.keyboardDuplicateEvent)
		window.removeEventListener('resize', this.handleResize)
		
		// Clean up resize timeout
		if (this.resizeTimeout) {
			clearTimeout(this.resizeTimeout)
		}
		
		// Clean up ResizeObserver
		if (this.popoverResizeObserver) {
			this.popoverResizeObserver.disconnect()
		}
	},

	methods: {
		closePopover() {
			this.showMask = false
		},

		handleResize() {
			// Debounce resize events
			if (this.resizeTimeout) {
				clearTimeout(this.resizeTimeout)
			}
			this.resizeTimeout = setTimeout(() => {
				this.repositionPopover()
			}, 100)
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
			} else if (isNew) {
				matchingDomObject = document.querySelector('.fc-highlight')

				if (!matchingDomObject) {
					matchingDomObject = document.querySelector('.fc-event[data-is-new="yes"]')
				}
			} else {
				const objectId = route.params.object
				const recurrenceId = route.params.recurrenceId

				matchingDomObject = document.querySelector(`.fc-event[data-object-id="${objectId}"][data-recurrence-id="${recurrenceId}"]`)
			}

			if (!matchingDomObject) {
				matchingDomObject = document.querySelector('#app-navigation-vue')
			}

			if (!matchingDomObject) {
				matchingDomObject = document.querySelector('body')
			}

			return matchingDomObject
		},

		repositionPopover(force = false) {
			const isNew = this.isWidget ? false : this.$route.name === 'NewPopoverView'
			const targetElement = this.getDomElementForPopover(isNew, this.$route)
			
			if (!targetElement) {
				console.warn('[calendar] EditSimple: No target element found for popover')
				return
			}

			// Skip if target hasn't changed, unless forced
			if (!force && targetElement === this.lastTargetElement) {
				return
			}
			
			this.lastTargetElement = targetElement
			
			this.$nextTick(() => {
				this.calculateAndApplyPosition(targetElement)
			})
		},

		/**
		 * Check if popover is out of bounds after resize and adjust position if needed
		 */
		adjustPopoverPositionIfNeeded() {
			const popoverEl = document.querySelector('.event-popover.v-popper__popper')
			if (!popoverEl || !this.boundaryElement) {
				return
			}

			const SPACING = 8
			const popoverRect = popoverEl.getBoundingClientRect()
			const boundaryRect = this.boundaryElement.getBoundingClientRect()

			let needsAdjustment = false
			let adjustedTop = parseInt(this.popoverStyle.top)
			let adjustedLeft = parseInt(this.popoverStyle.left)

			// Check if popover bottom is out of bounds
			if (popoverRect.bottom > boundaryRect.bottom - SPACING) {
				// Move up
				const overflow = popoverRect.bottom - (boundaryRect.bottom - SPACING)
				adjustedTop -= overflow
				needsAdjustment = true
			}

			// Check if popover top is out of bounds
			if (popoverRect.top < boundaryRect.top + SPACING) {
				adjustedTop = boundaryRect.top + SPACING
				needsAdjustment = true
			}

			// Check if popover right is out of bounds
			if (popoverRect.right > boundaryRect.right - SPACING) {
				const overflow = popoverRect.right - (boundaryRect.right - SPACING)
				adjustedLeft -= overflow
				needsAdjustment = true
			}

			// Check if popover left is out of bounds
			if (popoverRect.left < boundaryRect.left + SPACING) {
				adjustedLeft = boundaryRect.left + SPACING
				needsAdjustment = true
			}

			// Only update if we detected an out-of-bounds condition
			if (needsAdjustment) {
				this.popoverStyle.top = `${adjustedTop}px`
				this.popoverStyle.left = `${adjustedLeft}px`
			}
		},

		/**
		 * Calculate the popover position based on target element
		 */
		calculateAndApplyPosition(targetElement) {
			// Get current popover element if it exists
			const existingPopover = document.querySelector('.event-popover.v-popper__popper')
			let estimatedHeight = existingPopover?.offsetHeight || 400
			let estimatedWidth = existingPopover?.offsetWidth || 520
			const SPACING = 16

			// Get rectangles
			const targetRect = targetElement.getBoundingClientRect()
			const boundaryRect = this.boundaryElement?.getBoundingClientRect() || {
				top: 0,
				left: 0,
				right: window.innerWidth,
				bottom: window.innerHeight,
			}

			// Detect if target element is a fallback (body or navigation) - meaning the actual event element doesn't exist yet
			const isTargetFallback = targetElement === document.body || targetElement.id === 'app-navigation-vue'

			// Detect if target element spans most of the boundary width (like all-week or single day view events)
			const boundaryWidth = boundaryRect.right - boundaryRect.left
			const boundaryHeight = boundaryRect.bottom - boundaryRect.top
			const targetWidth = targetRect.right - targetRect.left
			const isFullWidthElement = targetWidth > boundaryWidth * 0.7

			// Calculate available space in all directions
			const spaceBelow = boundaryRect.bottom - targetRect.bottom - SPACING
			const spaceAbove = targetRect.top - boundaryRect.top - SPACING
			const spaceRight = boundaryRect.right - targetRect.right - SPACING
			const spaceLeft = targetRect.left - boundaryRect.left - SPACING

			let top = targetRect.bottom + SPACING
			let left = targetRect.left

			// If target element doesn't exist yet (fallback element), center in boundary
			if (isTargetFallback) {
				top = boundaryRect.top + (boundaryHeight - estimatedHeight) / 2
				left = boundaryRect.left + (boundaryWidth - estimatedWidth) / 2
			} else {
				// Determine best positioning strategy
				const canFitRight = spaceRight >= estimatedWidth
				const canFitLeft = spaceLeft >= estimatedWidth
				const canFitBelow = spaceBelow >= estimatedHeight
				const canFitAbove = spaceAbove >= estimatedHeight

				if (canFitRight) {
					// Position to the right
					top = targetRect.top
					left = targetRect.right + SPACING
				} else if (canFitLeft) {
					// Position to the left
					top = targetRect.top
					left = targetRect.left - estimatedWidth - SPACING
				} else if (canFitBelow) {
					// Position below
					top = targetRect.bottom + SPACING
					// If target spans full width, center popover horizontally
					left = isFullWidthElement ? boundaryRect.left + (boundaryWidth - estimatedWidth) / 2 : targetRect.left
				} else if (canFitAbove) {
					// Position above
					top = targetRect.top - estimatedHeight - SPACING
					// If target spans full width, center popover horizontally
					left = isFullWidthElement ? boundaryRect.left + (boundaryWidth - estimatedWidth) / 2 : targetRect.left
				} else {
					// Can't fit anywhere perfectly - use best available space
					if (spaceRight > spaceLeft && spaceRight > spaceBelow && spaceRight > spaceAbove) {
						top = targetRect.top
						left = targetRect.right + SPACING
					} else if (spaceLeft > spaceBelow && spaceLeft > spaceAbove) {
						top = targetRect.top
						left = targetRect.left - estimatedWidth - SPACING
					} else if (spaceBelow > spaceAbove) {
						top = targetRect.bottom + SPACING
						// If target spans full width, center popover horizontally
						left = isFullWidthElement ? boundaryRect.left + (boundaryWidth - estimatedWidth) / 2 : targetRect.left
					} else {
						top = targetRect.top - estimatedHeight - SPACING
						// If target spans full width, center popover horizontally
						left = isFullWidthElement ? boundaryRect.left + (boundaryWidth - estimatedWidth) / 2 : targetRect.left
					}
				}
			}

			// Keep horizontal position within bounds
			if (left + estimatedWidth > boundaryRect.right - SPACING) {
				left = boundaryRect.right - estimatedWidth - SPACING
			}
			if (left < boundaryRect.left + SPACING) {
				left = boundaryRect.left + SPACING
			}

			// Keep vertical position within bounds
			if (top + estimatedHeight > boundaryRect.bottom - SPACING) {
				top = boundaryRect.bottom - estimatedHeight - SPACING
			}
			if (top < boundaryRect.top + SPACING) {
				top = boundaryRect.top + SPACING
			}

			// Apply the style
			this.popoverStyle = {
				position: 'fixed',
				top: `${top}px`,
				left: `${left}px`,
				zIndex: 9999,
				maxWidth: '100vw',
				maxHeight: '90vh',
				overflow: 'auto',
			}

			// Verify and fine-tune position before showing
			setTimeout(() => {
				// Only show popover after final positioning is complete
				this.popoverReady = true
			}, 100)
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
	display: flex !important;
	flex-direction: column !important;
	overflow: hidden !important; // Let flex children handle their own overflow
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

:deep(.event-popover.v-popper__popper) {
	position: fixed !important;
	box-shadow: 0 3px 14px rgba(0, 0, 0, 0.15) !important;
	border-radius: var(--border-radius-large) !important;
	background: var(--color-main-background) !important;
	border: 1px solid var(--color-border) !important;
	display: flex !important;
	flex-direction: column !important;
	max-height: 90vh !important;
	overflow: hidden !important; // Let flex children handle overflow
	margin: 0 !important;
	contain: layout !important;
}

.cancel-confirmation-dialog {
	z-index: 1000000 !important;
}

.event-popover .event-popover__inner {
	text-align: start;
	max-width: 480px;
	width: 480px;
	padding: calc(var(--default-grid-baseline) * 2);
	padding-top: var(--default-grid-baseline);
	padding-bottom: 0; // Remove bottom padding as footer will have its own

	.empty-content {
		margin-top: 0 !important;
		padding: calc(var(--default-grid-baseline) * 12);
	}

	.event-popover__header {
		position: sticky;
		top: 0;
		background: var(--color-main-background);
		z-index: 10;
		padding-bottom: calc(var(--default-grid-baseline) * 2);
		// Add shadow to indicate there's content below when scrolling
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: calc(-1 * var(--default-grid-baseline) * 2);
			right: calc(-1 * var(--default-grid-baseline) * 2);
			height: 1px;
			background: var(--color-border);
			opacity: 0;
			transition: opacity 0.2s ease;
		}
	}

	.event-popover__content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 4);
		padding-right: calc(var(--default-grid-baseline) * 4);
		// Ensure smooth scrolling
		-webkit-overflow-scrolling: touch;

		// Show header shadow when content is scrolled
		&:not(:first-child) {
			scroll-margin-top: calc(var(--default-grid-baseline) * 2);
		}
	}

	.event-popover__footer {
		position: sticky;
		bottom: 0;
		background: var(--color-main-background);
		padding-top: calc(var(--default-grid-baseline) * 2);
		padding-bottom: calc(var(--default-grid-baseline) * 2);
		border-top: 1px solid var(--color-border);
		// Add shadow to indicate there's content above
		box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.05);
		z-index: 10;
		flex-shrink: 0; // Prevent footer from being compressed
		min-height: min-content; // Ensure footer doesn't collapse
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

	.calendar-picker-header {
		margin-inline-start: 0 !important;
	}
}

</style>

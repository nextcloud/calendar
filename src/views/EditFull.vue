<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcModal v-if="calendarObjectInstance"
		v-model="showFullModal"
		class="calendar-edit-full"
		size="full"
		label-id="edit-full-modal"
		:name="t('calendar', 'Edit event')"
		:dark="false"
		@close="cancel">
		<div :class="['app-full', { 'app-full-readonly': isViewedByOrganizer === false }]">
			<template v-if="isLoading">
				<div class="app-full__loading-indicator">
					<div class="icon icon-loading app-full-tab-loading-indicator__icon" />
				</div>
			</template>
			<template v-else-if="isError">
				<NcEmptyContent :name="$t('calendar', 'Event does not exist')" :description="error">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
				</NcEmptyContent>
			</template>

			<div v-if="!isLoading && !isError">
				<div class="app-full__header__top">
					<div class="app-full__header__top__first">
						<div class="app-full__header__top-close-icon">
							<Close :size="20" @click="cancel" />
						</div>

						<PropertyTitle :value="title"
							:is-read-only="isReadOnly || isViewedByOrganizer === false"
							@update:value="updateTitle" />
					</div>

					<div v-if="!isLoading && !isError" class="app-full__actions">
						<SaveButtons v-if="showSaveButtons"
							class="app-full-tab__buttons"
							:can-create-recurrence-exception="canCreateRecurrenceException"
							:is-new="isNew"
							:is-read-only="isReadOnly"
							:force-this-and-all-future="forceThisAndAllFuture"
							@save-this-only="prepareAccessForAttachments(false)"
							@save-this-and-all-future="prepareAccessForAttachments(true)" />
						<div :class="['app-full__actions__inner', { 'app-full__actions__inner__readonly': isReadOnly }]">
							<NcActions>
								<NcActionLink v-if="!hideEventExport && hasDownloadURL && !isNew" :href="downloadURL">
									<template #icon>
										<Download :size="20" decorative />
									</template>
									{{ $t('calendar', 'Export') }}
								</NcActionLink>
								<NcActionButton v-if="!canCreateRecurrenceException && !isReadOnly && !isNew" type="tertiary" @click="duplicateEvent()">
									<template #icon>
										<ContentDuplicate :size="20" decorative />
									</template>
									{{ $t('calendar', 'Duplicate') }}
								</NcActionButton>
								<NcActionButton v-if="canDelete && !canCreateRecurrenceException && !isNew" type="tertiary" @click="deleteAndLeave(false)">
									<template #icon>
										<Delete :size="20" decorative />
									</template>
									{{ $t('calendar', 'Delete') }}
								</NcActionButton>
								<NcActionButton v-if="canDelete && canCreateRecurrenceException && !isNew" type="tertiary" @click="deleteAndLeave(false)">
									<template #icon>
										<Delete :size="20" decorative />
									</template>
									{{ $t('calendar', 'Delete this occurrence') }}
								</NcActionButton>
								<NcActionButton v-if="canDelete && canCreateRecurrenceException && !isNew" type="tertiary" @click="deleteAndLeave(true)">
									<template #icon>
										<Delete :size="20" decorative />
									</template>
									{{ $t('calendar', 'Delete this and all future') }}
								</NcActionButton>
							</NcActions>
						</div>
					</div>
				</div>

				<div class="app-full__header">
					<PropertyTitleTimePicker :start-date="startDate"
						:start-timezone="startTimezone"
						:end-date="endDate"
						:end-timezone="endTimezone"
						:is-all-day="isAllDay"
						:is-read-only="isReadOnly || isViewedByOrganizer === false"
						:can-modify-all-day="canModifyAllDay"
						:user-timezone="currentUserTimezone"
						:append-to-body="true"
						@update-start-date="updateStartDate"
						@update-start-time="updateStartTime"
						@update-start-timezone="updateStartTimezone"
						@update-end-date="updateEndDate"
						@update-end-time="updateEndTime"
						@update-end-timezone="updateEndTimezone" />

					<div v-if="!isReadOnly" class="app-full__header__details">
						<div class="app-full__header__details-time">
							<NcCheckboxRadioSwitch v-if="!isReadOnly && !isViewedByAttendee"
								:checked="isAllDay"
								:disabled="!canModifyAllDay"
								@update:checked="toggleAllDayPreliminary">
								{{ $t('calendar', 'All day') }}
							</NcCheckboxRadioSwitch>

							<!-- TODO: If not editing the master item, force updating this and all future   -->
							<!-- TODO: You can't edit recurrence-rule of no-range recurrence-exception -->
							<Repeat :calendar-object-instance="calendarObjectInstance"
								:recurrence-rule="calendarObjectInstance.recurrenceRule"
								:is-read-only="isReadOnly || isViewedByOrganizer === false"
								:is-editing-master-item="isEditingMasterItem"
								:is-recurrence-exception="isRecurrenceException"
								@force-this-and-all-future="forceModifyingFuture" />
						</div>

						<div class="app-full__header__details-calendar">
							<CalendarPickerHeader :value="selectedCalendar"
								:calendars="calendars"
								:is-read-only="isReadOnly || !canModifyCalendar"
								:is-viewed-by-attendee="isViewedByOrganizer === false"
								@update:value="changeCalendar" />
							<NcPopover v-if="isViewedByOrganizer === false" :focus-trap="false">
								<template #trigger>
									<NcButton type="tertiary-no-background">
										<template #icon>
											<HelpCircleIcon :size="20" />
										</template>
									</NcButton>
								</template>
								<template #default>
									<p class="warning-text">
										{{ $t('calendar', 'Modifications wont get propagated to the organizer and other attendees') }}
									</p>
								</template>
							</NcPopover>
						</div>
					</div>

					<InvitationResponseButtons v-if="isViewedByAttendee"
						:attendee="userAsAttendee"
						:calendar-id="calendarId"
						:narrow="true"
						:grow-horizontally="true"
						@close="closeEditorAndSkipAction" />
				</div>

				<div class="app-full-body">
					<div class="app-full-body__left">
						<PropertyText class="property-location"
							:is-read-only="isReadOnly || isViewedByOrganizer === false"
							:prop-model="rfcProps.location"
							:value="location"
							:linkify-links="true"
							@update:value="updateLocation" />
						<PropertyText class="property-description"
							:is-read-only="isReadOnly"
							:prop-model="rfcProps.description"
							:value="description"
							:is-description="true"
							:linkify-links="true"
							@update:value="updateDescription" />

						<AlarmList :calendar-object-instance="calendarObjectInstance"
							:is-read-only="isReadOnly" />

						<AttachmentsList v-if="!isLoading"
							:calendar-object-instance="calendarObjectInstance"
							:is-read-only="isReadOnly" />
					</div>

					<div class="app-full-body__right">
						<div v-if="isCreateTalkRoomButtonVisible"
							class="property-add-talk">
							<IconVideo :size="20" class="property-text__icon property-add-talk__icon" />
							<AddTalkModal v-if="isModalOpen"
								:conversations="talkConversations"
								:calendar-object-instance="calendarObjectInstance"
								@close="isModalOpen = false"
								@update-location="updateLocation"
								@update-description="updateDescription" />
							<NcButton class="property-add-talk__button"
								:disabled="isCreateTalkRoomButtonDisabled"
								style="width: 100%"
								@click="openModal">
								{{ t('calendar','Add Talk conversation') }}
							</NcButton>
						</div>
						<PropertySelect :is-read-only="isReadOnly"
							:prop-model="rfcProps.status"
							:value="status"
							@update:value="updateStatus" />
						<PropertySelect :is-read-only="isReadOnly || isViewedByOrganizer === false"
							:prop-model="rfcProps.accessClass"
							:value="accessClass"
							@update:value="updateAccessClass" />
						<PropertySelect :is-read-only="isReadOnly"
							:prop-model="rfcProps.timeTransparency"
							:value="timeTransparency"
							@update:value="updateTimeTransparency" />
						<PropertySelectMultiple class="property-categories"
							:colored-options="true"
							:is-read-only="isReadOnly"
							:prop-model="rfcProps.categories"
							:value="categories"
							@add-single-value="addCategory"
							@remove-single-value="removeCategory" />
						<PropertyColor :calendar-color="selectedCalendarColor"
							:show-icon="!(isReadOnly && color === null)"
							:is-read-only="isReadOnly"
							:prop-model="rfcProps.color"
							:value="color"
							@update:value="updateColor" />
					</div>
				</div>

				<NcModal v-if="showModal && !isPrivate()"
					:name="t('calendar', 'Managing shared access')"
					@close="closeAttachmentsModal">
					<div class="modal-content">
						<div v-if="showPreloader" class="modal-content-preloader">
							<div :style="`width:${sharedProgress}%`" />
						</div>
						<div class="modal-h">
							{{ n('calendar', 'User requires access to your file', 'Users require access to your file', showModalUsers.length) }}
						</div>
						<div class="users">
							<NcListItemIcon v-for="attendee in showModalUsers"
								:key="attendee.uri"
								class="user-list-item"
								:name="attendee.commonName"
								:subtitle="emailWithoutMailto(attendee.uri)"
								:is-no-user="true" />
						</div>
						<div class="modal-subtitle">
							{{ n('calendar', 'Attachment requires shared access', 'Attachments requiring shared access', showModalNewAttachments.length) }}
						</div>
						<div class="attachments">
							<NcListItemIcon v-for="attachment in showModalNewAttachments"
								:key="attachment.xNcFileId"
								class="attachment-list-item"
								:name="getBaseName(attachment.fileName)"
								:url="getPreview(attachment)"
								:force-display-actions="false" />
						</div>
						<div class="modal-footer">
							<div class="modal-footer-checkbox">
								<NcCheckboxRadioSwitch v-if="!isPrivate()" :checked.sync="doNotShare">
									{{ t('calendar', 'Deny access') }}
								</NcCheckboxRadioSwitch>
							</div>
							<div class="modal-footer-buttons">
								<NcButton @click="closeAttachmentsModal">
									{{ t('calendar', 'Cancel') }}
								</NcButton>
								<NcButton type="primary"
									:disabled="showPreloader"
									@click="acceptAttachmentsModal(thisAndAllFuture)">
									{{ t('calendar', 'Invite') }}
								</NcButton>
							</div>
						</div>
					</div>
				</NcModal>

				<div class="app-full-footer">
					<div class="app-full-footer__left">
						<InviteesList v-if="!isLoading"
							:calendar="selectedCalendar"
							:calendar-object-instance="calendarObjectInstance"
							:is-read-only="isReadOnly || isViewedByOrganizer === false"
							:is-shared-with-me="isSharedWithMe"
							:show-header="true"
							@update-dates="updateDates" />
					</div>

					<div class="app-full-footer__right">
						<ResourceList v-if="!isLoading"
							:calendar-object-instance="calendarObjectInstance"
							:is-read-only="isReadOnly || isViewedByOrganizer === false" />
					</div>
				</div>
			</div>
		</div>
	</NcModal>
</template>
<script>
import {
	NcActionButton,
	NcActionLink,
	NcEmptyContent,
	NcModal,
	NcListItemIcon,
	NcButton,
	NcCheckboxRadioSwitch,
	NcPopover,
	NcActions,
} from '@nextcloud/vue'

import { generateUrl } from '@nextcloud/router'

import AlarmList from '../components/Editor/Alarm/AlarmList.vue'

import InviteesList from '../components/Editor/Invitees/InviteesList.vue'
import PropertySelect from '../components/Editor/Properties/PropertySelect.vue'
import PropertyText from '../components/Editor/Properties/PropertyText.vue'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker.vue'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle.vue'
import Repeat from '../components/Editor/Repeat/Repeat.vue'

import EditorMixin from '../mixins/EditorMixin.js'
import moment from '@nextcloud/moment'
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PropertySelectMultiple from '../components/Editor/Properties/PropertySelectMultiple.vue'
import PropertyColor from '../components/Editor/Properties/PropertyColor.vue'
import ResourceList from '../components/Editor/Resources/ResourceList.vue'
import InvitationResponseButtons from '../components/Editor/InvitationResponseButtons.vue'
import AttachmentsList from '../components/Editor/Attachments/AttachmentsList.vue'
import CalendarPickerHeader from '../components/Editor/CalendarPickerHeader.vue'

import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Download from 'vue-material-design-icons/Download.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'

import { shareFile } from '../services/attachmentService.js'
import { Parameter } from '@nextcloud/calendar-js'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import logger from '../utils/logger.js'

import usePrincipalsStore from '../store/principals.js'
import useSettingsStore from '../store/settings.js'
import useCalendarObjectInstanceStore from '../store/calendarObjectInstance.js'
import { mapStores, mapState } from 'pinia'
import AddTalkModal from '../components/Editor/AddTalkModal.vue'
import { doesContainTalkLink } from '../services/talkService.js'
import IconVideo from 'vue-material-design-icons/Video.vue'
import HelpCircleIcon from 'vue-material-design-icons/HelpCircle.vue'
import Close from 'vue-material-design-icons/Close.vue'

export default {
	name: 'EditFull',
	components: {
		AddTalkModal,
		ResourceList,
		PropertyColor,
		PropertySelectMultiple,
		SaveButtons,
		AlarmList,
		NcActionButton,
		NcActionLink,
		NcEmptyContent,
		NcModal,
		NcListItemIcon,
		NcButton,
		NcCheckboxRadioSwitch,
		NcPopover,
		InviteesList,
		PropertySelect,
		PropertyText,
		PropertyTitleTimePicker,
		Repeat,
		CalendarBlank,
		Delete,
		Download,
		ContentDuplicate,
		InvitationResponseButtons,
		AttachmentsList,
		CalendarPickerHeader,
		PropertyTitle,
		IconVideo,
		HelpCircleIcon,
		NcActions,
		Close,
	},
	mixins: [
		EditorMixin,
	],
	data() {
		return {
			thisAndAllFuture: false,
			doNotShare: false,
			showModal: false,
			showModalNewAttachments: [],
			showModalUsers: [],
			sharedProgress: 0,
			showPreloader: false,
			isModalOpen: false,
			talkConversations: [],
			selectedConversation: null,
			showFullModal: true,
		}
	},
	computed: {
		...mapStores(usePrincipalsStore),
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
			hideEventExport: 'hideEventExport',
			attachmentsFolder: 'attachmentsFolder',
			showResources: 'showResources',
		}),
		...mapState(useCalendarObjectInstanceStore, ['calendarObjectInstance']),
		...mapState(useSettingsStore, ['talkEnabled']),
		accessClass() {
			return this.calendarObjectInstance?.accessClass || null
		},
		categories() {
			return this.calendarObjectInstance?.categories || null
		},
		status() {
			return this.calendarObjectInstance?.status || null
		},
		timeTransparency() {
			return this.calendarObjectInstance?.timeTransparency || null
		},
		subTitle() {
			if (!this.calendarObjectInstance) {
				return ''
			}

			const userTimezone = getTimezoneManager().getTimezoneForId(this.currentUserTimezone)
			if (!userTimezone) {
				logger.warn(`User timezone not found: ${this.currentUserTimezone}`)
				return ''
			}

			const startDateInUserTz = this.calendarObjectInstance.eventComponent.startDate
				.getInTimezone(userTimezone)
				.jsDate
			return moment(startDateInUserTz).locale(this.locale).fromNow()
		},
		attachments() {
			return this.calendarObjectInstance?.attachments || null
		},
		currentUser() {
			return this.principalsStore.getCurrentUserPrincipal || null
		},
		isCreateTalkRoomButtonDisabled() {
			if (this.creatingTalkRoom) {
				return true
			}

			if (doesContainTalkLink(this.calendarObjectInstance.location)) {
				return true
			}
			return doesContainTalkLink(this.calendarObjectInstance.description)

		},
		isCreateTalkRoomButtonVisible() {
			return this.talkEnabled && this.isViewedByOrganizer !== false && this.isReadOnly !== true
		},
		resources() {
			return this.calendarObjectInstance.attendees.filter(attendee => {
				return ['ROOM', 'RESOURCE'].includes(attendee.attendeeProperty.userType)
			})
		},
	},
	mounted() {
		window.addEventListener('keydown', this.keyboardCloseEditor)
		window.addEventListener('keydown', this.keyboardSaveEvent)
		window.addEventListener('keydown', this.keyboardDeleteEvent)
		window.addEventListener('keydown', this.keyboardDuplicateEvent)
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.keyboardCloseEditor)
		window.removeEventListener('keydown', this.keyboardSaveEvent)
		window.removeEventListener('keydown', this.keyboardDeleteEvent)
		window.removeEventListener('keydown', this.keyboardDuplicateEvent)
	},
	methods: {
		openModal() {
			this.isModalOpen = true
		},

		updateLocation(location) {
			this.calendarObjectInstanceStore.changeLocation({
				calendarObjectInstance: this.calendarObjectInstance,
				location,
			})
		},
		updateDescription(description) {
			this.calendarObjectInstanceStore.changeDescription({
				calendarObjectInstance: this.calendarObjectInstance,
				description,
			})
		},
		/**
		 * Update the start and end date of this event
		 *
		 * @param {object} dates The new start and end date
		 */
		updateDates(dates) {
			this.updateStartDate(dates.start)
			this.updateStartTime(dates.start)
			this.updateEndDate(dates.end)
			this.updateEndTime(dates.end)
		},
		/**
		 * Updates the access-class of this event
		 *
		 * @param {string} accessClass The new access class
		 */
		updateAccessClass(accessClass) {
			this.calendarObjectInstanceStore.changeAccessClass({
				calendarObjectInstance: this.calendarObjectInstance,
				accessClass,
			})
		},
		/**
		 * Updates the status of the event
		 *
		 * @param {string} status The new status
		 */
		updateStatus(status) {
			this.calendarObjectInstanceStore.changeStatus({
				calendarObjectInstance: this.calendarObjectInstance,
				status,
			})
		},
		/**
		 * Updates the time-transparency of the event
		 *
		 * @param {string} timeTransparency The new time-transparency
		 */
		updateTimeTransparency(timeTransparency) {
			this.calendarObjectInstanceStore.changeTimeTransparency({
				calendarObjectInstance: this.calendarObjectInstance,
				timeTransparency,
			})
		},
		/**
		 * Adds a category to the event
		 *
		 * @param {string} category Category to add
		 */
		addCategory(category) {
			this.calendarObjectInstanceStore.addCategory({
				calendarObjectInstance: this.calendarObjectInstance,
				category,
			})
		},
		/**
		 * Removes a category from the event
		 *
		 * @param {string} category Category to remove
		 */
		removeCategory(category) {
			this.calendarObjectInstanceStore.removeCategory({
				calendarObjectInstance: this.calendarObjectInstance,
				category,
			})
		},
		/**
		 * Updates the color of the event
		 *
		 * @param {string} customColor The new color
		 */
		updateColor(customColor) {
			this.calendarObjectInstanceStore.changeCustomColor({
				calendarObjectInstance: this.calendarObjectInstance,
				customColor,
			})
		},
		/**
		 * Checks is the calendar event has attendees, but organizer or not
		 *
		 * @return {boolean}
		 */
		isPrivate() {
			return this.calendarObjectInstance.attendees.filter((attendee) => {
				if (this.currentUser.emailAddress.toLowerCase() !== (
					attendee.uri.split('mailto:').length === 2
						? attendee.uri.split('mailto:')[1].toLowerCase()
						: attendee.uri.toLowerCase()
				)) {
					return attendee
				}
				return false
			}).length === 0
		},
		getPreview(attachment) {
			if (attachment.xNcHasPreview) {
				return generateUrl(`/core/preview?fileId=${attachment.xNcFileId}&x=100&y=100&a=0`)
			}
			return attachment.formatType
				? OC.MimeType.getIconUrl(attachment.formatType)
				: OC.MimeType.getIconUrl('folder')
		},
		acceptAttachmentsModal() {
			if (!this.doNotShare) {
				const total = this.showModalNewAttachments.length
				this.showPreloader = true
				if (!this.isPrivate()) {
					this.showModalNewAttachments.map(async (attachment, i) => {
						this.sharedProgress = Math.ceil(100 * (i + 1) / total)

						// add share + change attachment
						try {
							const data = await shareFile(`${this.attachmentsFolder}${attachment.fileName}`)
							attachment.shareTypes = data?.share_type?.toString()
							if (typeof attachment.attachmentProperty.getParameter('X-NC-SHARED-TYPES') === 'undefined') {
								const xNcSharedTypes = new Parameter('X-NC-SHARED-TYPES', attachment.shareTypes)
								attachment.attachmentProperty.setParameter(xNcSharedTypes)
							}
							attachment.attachmentProperty.uri = data?.url
							attachment.uri = data?.url
							// toastify success
						} catch (e) {
							// toastify err
							console.error(e)
						}
						return attachment
					})

				} else {
					// TODO it is not possible to delete shares, because share ID needed
					/* this.showModalNewAttachments.map((attachment, i) => {
						this.sharedProgress += Math.ceil(100 * (i + 1) / total)
						return attachment
					}) */
				}
			}
			setTimeout(() => {
				this.showPreloader = false
				this.sharedProgress = 0
				this.showModal = false
				this.showModalNewAttachments = []
				this.showModalUsers = []
				this.saveEvent(this.thisAndAllFuture)
			}, 500)
			// trigger save event after make each attachment access
			// 1) if !isPrivate get attachments NOT SHARED  and SharedType is empry -> API ADD SHARE
			// 2) if isPrivate get attachments SHARED  and SharedType is not empty -> API DELETE SHARE
			// 3) update calendarObject while pending access change
			// 4) after all access changes, save Event trigger
			// 5) done
		},
		closeAttachmentsModal() {
			this.showModal = false
		},
		emailWithoutMailto(mailto) {
			return mailto.split('mailto:').length === 2
				? mailto.split('mailto:')[1].toLowerCase()
				: mailto.toLowerCase()
		},
		getBaseName(name) {
			return name.split('/').pop()
		},
		prepareAccessForAttachments(thisAndAllFuture = false) {
			this.thisAndAllFuture = thisAndAllFuture
			const newAttachments = this.calendarObjectInstance.attachments.filter(attachment => {
				// get only new attachments
				// TODO get NOT only new attachments =) Maybe we should filter all attachments without share-type, 'cause event can be private and AFTER save owner could add new participant
				return !this.isPrivate() ? attachment.isNew && attachment.shareTypes === null : attachment.isNew && attachment.shareTypes !== null
			})
			// if there are new attachment and event not saved
			if (newAttachments.length > 0 && !this.isPrivate()) {
				// and is event NOT private,
				// then add share to each attachment
				// only if attachment['share-types'] is null or empty
				this.showModal = true
				this.showModalNewAttachments = newAttachments
				this.showModalUsers = this.calendarObjectInstance.attendees.filter((attendee) => {
					if (this.currentUser.emailAddress.toLowerCase() !== this.emailWithoutMailto(attendee.uri)) {
						return attendee
					}
					return false
				})
			} else {
				this.saveEvent(thisAndAllFuture)
			}
		},
		saveEvent(thisAndAllFuture = false) {
			// if there is new attachments and !private, then make modal with users and files/
			// maybe check shared access before add file
			this.saveAndLeave(thisAndAllFuture)
			this.calendarObjectInstance.attachments = this.calendarObjectInstance.attachments.map(attachment => {
				if (attachment.isNew) {
					delete attachment.isNew
				}
				return attachment
			})
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
.modal-mask {
	height: calc(100vh - var(--header-height));
	top: var(--header-height);
}

.modal-content {
	padding: 16px;
	position: relative;

	.modal-content-preloader {
		position: absolute;
		top:0;
		inset-inline:0;
		height: 6px;

		div {
			position: absolute;
			top:0;
			inset-inline-start: 0;
			background: var(--color-primary-element);
			height: 6px;
			transition: width 0.3s linear;
		}
	}
}

.modal-subtitle {
	font-weight: bold;
	font-size: 16px;
	margin-top: 16px;
}

.modal-h {
	font-size: 24px;
	font-weight: bold;
	margin: 10px 0;
}

.modal-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.modal-footer-buttons {
		display: flex;

		:first-child {
			margin-inline-end: 6px;
		}
	}
}

.attachments, .users {
	display: flex;
	flex-wrap: wrap;
}

.attachment-list-item, .user-list-item {
	width: 50%
}

.attachment-icon {
	width: 40px;
	height: auto;
	border-radius: var(--border-radius);
}
</style>

<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<FreeBusy v-if="initialized"
		:dialog-name="dialogName"
		:start-date="startDate"
		:end-date="endDate"
		:organizer="organizer"
		:attendees="attendees"
		:disable-find-time="true"
		@add-attendee="addAttendee"
		@remove-attendee="removeAttendee"
		@close="close" />
</template>

<script>
import { mapStores } from 'pinia'
import usePrincipalsStore from '../store/principals.js'
import useSettingsStore from '../store/settings.js'
import {
	mapAttendeePropertyToAttendeeObject,
	mapPrincipalObjectToAttendeeObject,
} from '../models/attendee.js'
import loadMomentLocalization from '../utils/moment.js'
import { initializeClientForUserView } from '../services/caldavService.js'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import FreeBusy from '../components/Editor/FreeBusy/FreeBusy.vue'
import { AttendeeProperty } from '@nextcloud/calendar-js'

export default {
	name: 'ContactsMenuAvailability',
	components: {
		FreeBusy,
	},
	props: {
		userId: {
			type: String,
			required: true,
		},
		userDisplayName: {
			type: String,
			required: true,
		},
		userEmail: {
			type: String,
			required: true,
		},
	},
	data() {
		const initialAttendee = AttendeeProperty.fromNameAndEMail(
			this.userDisplayName,
			this.userEmail,
		)
		const attendees = [mapAttendeePropertyToAttendeeObject(initialAttendee)]

		return {
			initialized: false,
			attendees,
		}
	},
	computed: {
		...mapStores(usePrincipalsStore, useSettingsStore),
		dialogName() {
			return t('calendar', 'Availability of {displayName}', {
				displayName: this.userDisplayName,
			})
		},
		startDate() {
			return new Date()
		},
		endDate() {
			// Let's assign a slot of one hour as a default for now
			const date = new Date(this.startDate)
			date.setHours(date.getHours() + 1)
			return date
		},
		organizer() {
			if (!this.principalsStore.getCurrentUserPrincipal) {
				throw new Error('No principal available for current user')
			}

			return mapPrincipalObjectToAttendeeObject(
				this.principalsStore.getCurrentUserPrincipal,
				true,
			)
		},
	},
	async created() {
		this.initSettings()
		await initializeClientForUserView()
		await this.principalsStore.fetchCurrentUserPrincipal()
		getTimezoneManager()
		await this.loadMomentLocale()
		this.initialized = true
	},
	methods: {
		initSettings() {
			this.settingsStore.loadSettingsFromServer({
				timezone: 'automatic',
			})
			this.settingsStore.initializeCalendarJsConfig()
		},
		async loadMomentLocale() {
			const locale = await loadMomentLocalization()
			this.settingsStore.setMomentLocale({ locale })
		},
		addAttendee({ commonName, email }) {
			this.attendees.push(mapAttendeePropertyToAttendeeObject(
				AttendeeProperty.fromNameAndEMail(commonName, email),
			))
		},
		removeAttendee({ email }) {
			this.attendees = this.attendees.filter((att) => att.uri !== email)
		},
		close() {
			this.$destroy()
		},
	},
}
</script>

<style lang="scss" scoped>
</style>

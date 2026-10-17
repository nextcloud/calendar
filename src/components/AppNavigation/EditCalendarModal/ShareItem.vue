<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { CalendarInterface, CalendarShareInterface } from '@/types/calendar.ts'

import { showInfo } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { NcActionButton, NcActions, NcAvatar, NcCheckboxRadioSwitch } from '@nextcloud/vue'
import { computed, onMounted, ref } from 'vue'
import AccountGroupIcon from 'vue-material-design-icons/AccountGroupOutline.vue'
import AccountMultiple from 'vue-material-design-icons/AccountMultipleOutline.vue'
import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import useCalendarsStore from '@/store/calendars.js'
import usePrincipalsStore from '@/store/principals.js'
import logger from '@/utils/logger.js'

const props = defineProps<{
	calendar: CalendarInterface
	sharee: CalendarShareInterface
}>()

const calendarsStore = useCalendarsStore()
const principalsStore = usePrincipalsStore()

const updatingSharee = ref(false)
const shareeEmail = ref('')
const isWriteable = ref(props.sharee.writeable)

const displayName = computed<string>(() => {
	if (props.sharee.isCircle) {
		return t('calendar', '{teamDisplayName} (Team)', {
			teamDisplayName: props.sharee.displayName ?? '',
		})
	}

	return props.sharee.displayName ?? ''
})

const canBeSharedWritable = computed<boolean>(() => {
	return props.calendar.canCreateObject || props.calendar.canModifyObject
})

/**
 * Unshares the calendar from the given sharee
 */
async function unshare(): Promise<void> {
	updatingSharee.value = true
	try {
		await calendarsStore.unshareCalendar({
			calendar: props.calendar,
			uri: props.sharee.uri,
		})
		updatingSharee.value = false
	} catch (error) {
		logger.error(error)
		showInfo(t('calendar', 'An error occurred while unsharing the calendar.'))

		updatingSharee.value = false
	}
}

/**
 * Toggles the write-permission of the share
 */
async function updatePermission(): Promise<void> {
	updatingSharee.value = true
	try {
		await calendarsStore.toggleCalendarShareWritable({
			calendar: props.calendar,
			uri: props.sharee.uri,
		})
		updatingSharee.value = false
	} catch (error) {
		logger.error(error)
		showInfo(t('calendar', 'An error occurred, unable to change the permission of the share.'))

		updatingSharee.value = false
	}
}

async function updateShareeEmail(): Promise<void> {
	if (props.sharee.isGroup || props.sharee.isCircle) {
		return
	}

	const shareeUrl = (props.sharee.uri ?? '').replace('principal:', '/remote.php/dav/') + '/'

	await principalsStore.fetchPrincipalByUrl({ url: shareeUrl })

	const principal = principalsStore.getPrincipalByUrl(shareeUrl)

	shareeEmail.value = principal.emailAddress
}

onMounted(() => {
	updateShareeEmail()
})
</script>

<template>
	<div class="share-item">
		<AccountMultiple v-if="sharee.isGroup" :size="20" class="share-item__group-icon" />
		<AccountGroupIcon v-else-if="sharee.isCircle" :size="20" class="share-item__team-icon" />
		<NcAvatar v-else :user="sharee.userId" :displayName="sharee.displayName" />

		<div class="share-item__label">
			{{ sharee.displayName }}
			<p>
				{{ shareeEmail }}
			</p>
		</div>

		<NcCheckboxRadioSwitch
			v-if="canBeSharedWritable"
			v-model="isWriteable"
			:disabled="updatingSharee"
			@update:modelValue="updatePermission">
			{{ t('calendar', 'can edit and see confidential events') }}
		</NcCheckboxRadioSwitch>

		<NcActions>
			<NcActionButton
				:disabled="updatingSharee"
				@click.prevent.stop="unshare">
				<template #icon>
					<Delete :size="20" decorative />
				</template>
				{{ t('calendar', 'Unshare with {displayName}', { displayName: sharee.displayName }) }}
			</NcActionButton>
		</NcActions>
	</div>
</template>

<style lang="scss" scoped>
.share-item {
	display: flex;
	align-items: center;
	gap: 10px;

	&__group-icon,
	&__team-icon {
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: white;
		background-color: var(--color-text-maxcontrast);
	}

	&__team-icon {
		// Upstream icon is slightly misaligned when centered using flex
		:deep(svg) {
			margin-bottom: 3px;
		}
	}

	&__label {
		flex: 1 auto;
		flex-direction: column;

		p {
			color: var(--color-text-lighter);
			line-height: 1;
		}
	}
}
</style>

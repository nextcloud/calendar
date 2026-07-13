<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { CalendarInterface } from '@/types/calendar.ts'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { n, t } from '@nextcloud/l10n'
import { generateRemoteUrl, generateUrl } from '@nextcloud/router'
import {
	NcActionButton as ActionButton,
	NcAppNavigationItem as AppNavigationItem,
	NcActionCaption,
	NcActionSeparator,
	NcActionText,
	NcAvatar,
} from '@nextcloud/vue'
import { computed, ref } from 'vue'
import CheckboxBlank from 'vue-material-design-icons/CheckboxBlankOutline.vue'
import CheckboxMarked from 'vue-material-design-icons/CheckboxMarked.vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import LinkVariant from 'vue-material-design-icons/Link.vue'
import Pencil from 'vue-material-design-icons/PencilOutline.vue'
import Undo from 'vue-material-design-icons/Undo.vue'
import useCalendarsStore from '@/store/calendars.js'
import usePrincipalsStore from '@/store/principals.js'

const props = defineProps<{
	calendar: CalendarInterface
}>()

const calendarsStore = useCalendarsStore()
const principalsStore = usePrincipalsStore()

const actionsMenuOpen = ref(false)

/**
 * Whether to show the sharing section
 */
const canBeShared = computed<boolean>(() => {
	// The backend falsely reports incoming editable shares as being shareable
	// Ref https://github.com/nextcloud/calendar/issues/5755
	if (props.calendar.isSharedWithMe || props.calendar.isDelegated) {
		return false
	}

	return props.calendar.canBeShared || props.calendar.canBePublished
})

/**
 * Whether the calendar is already published or not.
 */
const isPublished = computed<boolean>(() => props.calendar.publishURL !== null)

/**
 * Is the calendar shared with me?
 */
const isSharedWithMe = computed<boolean>(() => props.calendar.isSharedWithMe && !props.calendar.isDelegated)

/**
 * Is the calendar delegated to me by another user?
 */
const isDelegated = computed<boolean>(() => !!props.calendar.isDelegated)

/**
 * Is the calendar shared by me or published via a link?
 */
const isSharedByMe = computed<boolean>(() => props.calendar.shares.length > 0 || props.calendar.publishURL !== null)

/**
 * Whether or not the information about the owner principal was loaded
 */
const loadedOwnerPrincipal = computed<boolean>(() => principalsStore.getPrincipalByUrl(props.calendar.owner) !== undefined)

const loadedDelegatorPrincipal = computed<boolean>(() => principalsStore.getPrincipalByUrl(props.calendar.delegatorUrl) !== undefined)

const ownerUserId = computed<string>(() => {
	const principal = principalsStore.getPrincipalByUrl(props.calendar.owner)
	return principal?.userId || ''
})

const ownerDisplayname = computed<string>(() => {
	const principal = principalsStore.getPrincipalByUrl(props.calendar.owner)
	return principal?.displayname || ''
})

const delegatorUserId = computed<string>(() => {
	const principal = principalsStore.getPrincipalByUrl(props.calendar.delegatorUrl)
	return principal?.userId || ''
})

const delegatorDisplayname = computed<string>(() => {
	const principal = principalsStore.getPrincipalByUrl(props.calendar.delegatorUrl)
	return principal?.displayname || principal?.userId || ''
})

/**
 * compute aria-description for AppNavigationItem link
 */
const descriptionAppNavigationItem = computed<string>(() => {
	if (props.calendar.enabled && props.calendar.displayName) {
		return t('calendar', 'Disable calendar "{calendar}"', { calendar: props.calendar.displayName })
	} else if (props.calendar.enabled && !props.calendar.displayName) {
		return t('calendar', 'Disable untitled calendar')
	} else if (!props.calendar.enabled && props.calendar.displayName) {
		return t('calendar', 'Enable calendar "{calendar}"', { calendar: props.calendar.displayName })
	} else {
		return t('calendar', 'Enable untitled calendar')
	}
})

/**
 * Whether the calendar is currently being deleted
 */
const isBeingDeleted = computed<boolean>(() => !!props.calendar.deleteInterval)

/**
 * Countdown to the deletion of the calendar
 */
const countdown = computed<number>(() => props.calendar.countdown ?? 0)

const calendarDisplayName = computed<string>(() => {
	if (props.calendar.displayName.substring(0, 5) === 'Deck:') {
		return props.calendar.displayName.substring(5)
	} else {
		return props.calendar.displayName
	}
})

/**
 * Toggles the enabled state of this calendar
 */
async function toggleEnabled(): Promise<void> {
	try {
		await calendarsStore.toggleCalendarEnabled({ calendar: props.calendar })
	} catch (error) {
		showError(t('calendar', 'An error occurred, unable to change visibility of the calendar.'))
		console.error(error)
	}
}

/**
 * Cancels the deletion of a calendar
 */
function cancelDeleteCalendar(): void {
	calendarsStore.cancelCalendarDeletion({ calendar: props.calendar })
}

/**
 * Open the calendar modal for this calendar item.
 */
function showEditModal(): void {
	calendarsStore.editCalendarModal = { calendarId: props.calendar.id }
}

/**
 * Copies the public link of this calendar to the clipboard.
 */
async function copyPublicLink(): Promise<void> {
	const rootURL = generateRemoteUrl('dav')
	const token = props.calendar.publishURL!.split('/').slice(-1)[0]
	const url = new URL(generateUrl('apps/calendar') + '/p/' + token, rootURL)

	// copy link for calendar to clipboard
	try {
		await navigator.clipboard.writeText(url.href)
		showSuccess(t('calendar', 'Calendar link copied to clipboard.'))
	} catch (error) {
		console.debug(error)
		showError(t('calendar', 'Calendar link could not be copied to clipboard.'))
	}
}
</script>

<template>
	<AppNavigationItem
		:loading="calendar.loading"
		:aria-description="descriptionAppNavigationItem"
		:name="calendarDisplayName || t('calendar', 'Untitled calendar')"
		:class="{ deleted: isBeingDeleted, disabled: !calendar.enabled }"
		@update:menuOpen="actionsMenuOpen = $event"
		@click.prevent.stop="toggleEnabled">
		<template #icon>
			<CheckboxMarked
				v-if="calendar.enabled"
				:size="20"
				:fillColor="calendar.color"
				@click.prevent.stop="toggleEnabled" />
			<CheckboxBlank
				v-else
				:size="20"
				:fillColor="calendar.color"
				@click.prevent.stop="toggleEnabled" />
		</template>

		<template #counter>
			<LinkVariant v-if="isSharedByMe" :size="20" />
			<NcAvatar
				v-else-if="isDelegated && loadedDelegatorPrincipal && !actionsMenuOpen"
				:user="delegatorUserId"
				:displayName="delegatorDisplayname"
				:title="delegatorDisplayname"
				:hideStatus="true"
				:size="20"
				class="delegated-counter-avatar" />
			<NcAvatar
				v-else-if="isSharedWithMe && loadedOwnerPrincipal && !actionsMenuOpen"
				:user="ownerUserId"
				:displayName="ownerDisplayname" />
			<div v-else-if="(isSharedWithMe && !loadedOwnerPrincipal) || (isDelegated && !loadedDelegatorPrincipal)" class="icon icon-loading" />
		</template>

		<template #actions>
			<template v-if="!isBeingDeleted">
				<template v-if="isDelegated">
					<NcActionCaption :name="t('calendar', 'Delegated to you by')" />
					<NcActionText class="delegated-action-text">
						<template #icon>
							<div class="actions-icon-avatar">
								<NcAvatar :user="delegatorUserId" :displayName="delegatorDisplayname" :size="30" />
							</div>
						</template>
						{{ delegatorDisplayname }}
					</NcActionText>
					<NcActionSeparator />
				</template>
				<template v-else-if="isSharedWithMe">
					<NcActionCaption :name="t('calendar', 'Shared with you by')" />
					<NcActionText>
						<template #icon>
							<div class="actions-icon-avatar">
								<NcAvatar :user="ownerUserId" :displayName="ownerDisplayname" :size="30" />
							</div>
						</template>
						{{ ownerDisplayname }}
					</NcActionText>
					<NcActionSeparator />
				</template>
				<ActionButton v-if="isPublished" @click.prevent.stop="copyPublicLink">
					<template #icon>
						<ContentCopy :size="20" decorative />
					</template>
					{{ t('calendar', 'Copy public link') }}
				</ActionButton>
				<ActionButton @click.prevent.stop="showEditModal">
					<template #icon>
						<Pencil :size="20" decorative />
					</template>
					{{ canBeShared ? t('calendar', 'Edit and share calendar') : t('calendar', 'Edit calendar') }}
				</ActionButton>
			</template>
			<template v-else>
				<ActionButton
					v-if="calendar.isSharedWithMe"
					@click.prevent.stop="cancelDeleteCalendar">
					<template #icon>
						<Undo :size="20" decorative />
					</template>
					{{ n('calendar', 'Unsharing the calendar in {countdown} second', 'Unsharing the calendar in {countdown} seconds', countdown, { countdown }) }}
				</ActionButton>
				<ActionButton
					v-else
					@click.prevent.stop="cancelDeleteCalendar">
					<template #icon>
						<Undo :size="20" decorative />
					</template>
					{{ n('calendar', 'Deleting the calendar in {countdown} second', 'Deleting the calendar in {countdown} seconds', countdown, { countdown }) }}
				</ActionButton>
			</template>
		</template>
	</AppNavigationItem>
</template>

<style lang="scss" scoped>
	.actions-icon-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
	}

	// Size and position the delegated avatar in the counter slot to match icon buttons
	.delegated-counter-avatar {
		margin-inline-start: auto;
	}

	// Vertically align the owner name with the avatar in the "Delegated to you by" row
	:deep(.action-text__text) {
		align-self: center ;
	}

	// Hide avatars if list item is hovered
	:deep(.app-navigation-entry:hover .app-navigation-entry__counter-wrapper) {
		display: none;
	}

	.app-navigation-entry__counter-wrapper .action-item.sharing .material-design-icon.share {
		opacity: .3;
	}
</style>

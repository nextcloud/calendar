<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="delegation-settings">
		<NcNoteCard v-if="loadError" type="error">
			{{ t('calendar', 'Could not load delegates.') }}
		</NcNoteCard>

		<NcFormGroup
			:label="t('calendar', 'Delegates')"
			:description="t('calendar', 'Allow users to manage your calendar events and invitations on your behalf.')">
			<NcEmptyContent
				v-if="loading"
				icon="icon-loading"
				class="delegation-settings__loading"
				:description="t('calendar', 'Loading delegates\u2026')" />
			<ul v-else class="delegation-settings__list">
				<NcListItem
					v-for="delegate in delegationStore.delegates"
					:key="delegate.url ?? ''"
					:name="delegate.displayname || delegate.principalId || ''"
					:compact="true">
					<template #subname>
						{{ delegateSubname(delegate) }}
					</template>
					<template #actions>
						<NcActionButton
							:aria-label="t('calendar', 'Revoke access')"
							@click="onRevokeClick(delegate)">
							<template #icon>
								<CloseIcon :size="20" />
							</template>
							{{ t('calendar', 'Revoke access') }}
						</NcActionButton>
					</template>
				</NcListItem>
			</ul>

			<p v-if="!loading && delegationStore.delegates.length === 0" class="delegation-settings__empty">
				{{ t('calendar', 'No delegates yet.') }}
			</p>

			<NcButton
				class="delegation-settings__add-button"
				variant="secondary"
				:wide="true"
				@click="openAddDelegate">
				<template #icon>
					<PlusIcon :size="20" />
				</template>
				{{ t('calendar', 'Add delegate') }}
			</NcButton>
		</NcFormGroup>

		<!-- Revoke Confirmation Dialog -->
		<NcDialog
			v-if="revokeTarget"
			:open="!!revokeTarget"
			:name="t('calendar', 'Revoke access?')"
			:message="revokeMessage"
			:buttons="revokeButtons"
			@update:open="onRevokeDialogClose" />

		<!-- Add Delegate Dialog -->
		<NcDialog
			v-if="showAddDelegate"
			:open="showAddDelegate"
			:name="t('calendar', 'Add delegate')"
			@update:open="onAddDelegateDialogClose">
			<div class="delegation-add">
				<NcSelect
					v-model="selectedUser"
					class="delegation-add__select"
					:options="searchResults"
					:searchable="true"
					:internalSearch="false"
					:loading="searchLoading"
					:max-height="300"
					:placeholder="t('calendar', 'Search for a user\u2026')"
					:clearable="true"
					:filterBy="filterSearchResults"
					openDirection="below"
					trackBy="url"
					label="displayname"
					@search="onSearch">
					<template #no-options>
						<span>{{ t('calendar', 'No users found') }}</span>
					</template>
					<template #option="user">
						<div class="delegation-add__option">
							<NcAvatar :user="user.principalId" :displayName="user.displayname" />
							<div class="delegation-add__option-label">
								<span>{{ user.displayname }}</span>
								<span class="delegation-add__option-email">{{ user.emailAddress }}</span>
							</div>
						</div>
					</template>
				</NcSelect>
				<p class="delegation-add__description">
					{{ t('calendar', 'Choose whether they can view and edit events, or only view them.') }}
				</p>
			</div>
			<template #actions>
				<NcButton variant="secondary" @click="showAddDelegate = false">
					{{ t('calendar', 'Cancel') }}
				</NcButton>
				<NcButton
					variant="secondary"
					:disabled="!selectedUser || addLoading"
					@click="confirmAddDelegate('read')">
					{{ t('calendar', 'Add as viewer') }}
				</NcButton>
				<NcButton
					variant="primary"
					:disabled="!selectedUser || addLoading"
					@click="confirmAddDelegate('write')">
					{{ t('calendar', 'Add as editor') }}
				</NcButton>
			</template>
		</NcDialog>
	</div>
</template>

<script setup lang="ts">
import type { DelegatePrincipal } from '@/store/delegation.ts'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import {
	NcActionButton,
	NcAvatar,
	NcButton,
	NcDialog,
	NcEmptyContent,
	NcFormGroup,
	NcListItem,
	NcNoteCard,
	NcSelect,
} from '@nextcloud/vue'
import debounce from 'debounce'
import { computed, onMounted, ref } from 'vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import { principalPropertySearchByDisplaynameOrEmail } from '@/services/caldavService.js'
import useDelegationStore from '@/store/delegation.ts'
import usePrincipalsStore from '@/store/principals.js'
import logger from '@/utils/logger.js'

interface SearchUser {
	url: string
	displayname: string | null
	emailAddress: string | null
	principalId: string | null
}

const delegationStore = useDelegationStore()
const principalsStore = usePrincipalsStore()

/** Whether the data is being loaded */
const loading = ref(false)
/** Whether there was an error loading delegates */
const loadError = ref(false)
/** The delegate object pending revocation, or null */
const revokeTarget = ref<DelegatePrincipal | null>(null)
/** Whether the add-delegate dialog is open */
const showAddDelegate = ref(false)
/** Currently selected user in the add-delegate dialog */
const selectedUser = ref<SearchUser | null>(null)
/** Search results for user lookup */
const searchResults = ref<SearchUser[]>([])
/** Whether user search is in progress */
const searchLoading = ref(false)
/** Whether an add-delegate operation is in progress */
const addLoading = ref(false)

/**
 * Confirmation message for the revoke dialog.
 */
const revokeMessage = computed((): string => {
	if (!revokeTarget.value) {
		return ''
	}
	const email = revokeTarget.value.emailAddress
		|| revokeTarget.value.displayname
		|| revokeTarget.value.principalId
	return t('calendar', '{email} will no longer be able to act on your behalf.', { email: email ?? '' })
})

/**
 * Buttons for the revoke confirmation dialog.
 */
const revokeButtons = computed(() => [
	{
		label: t('calendar', 'Cancel'),
		callback: () => { revokeTarget.value = null },
	},
	{
		label: t('calendar', 'Revoke'),
		variant: 'error' as const,
		callback: confirmRevoke,
	},
])

onMounted(async () => {
	loadError.value = false
	loading.value = true
	try {
		await delegationStore.fetchDelegates()
	} catch (error) {
		logger.error('Failed to load delegates', { error })
		loadError.value = true
	} finally {
		loading.value = false
	}
})

/**
 * Returns a descriptive subname for a delegate list item
 * showing their permission level and optionally their email.
 *
 * @param delegate - The delegate principal object
 */
function delegateSubname(delegate: DelegatePrincipal): string {
	const permissionLabel = delegate.permission === 'read'
		? t('calendar', 'Viewer')
		: t('calendar', 'Editor')
	if (delegate.emailAddress) {
		return `${permissionLabel} · ${delegate.emailAddress}`
	}
	return permissionLabel
}

/**
 * Open the revoke confirmation dialog for a specific delegate.
 *
 * @param delegate - The delegate principal object
 */
function onRevokeClick(delegate: DelegatePrincipal): void {
	revokeTarget.value = delegate
}

/**
 * Handle the revoke dialog close event.
 *
 * @param open - New open state
 */
function onRevokeDialogClose(open: boolean): void {
	if (!open) {
		revokeTarget.value = null
	}
}

/**
 * Execute the revoke operation after user confirmation.
 */
async function confirmRevoke(): Promise<void> {
	if (!revokeTarget.value) {
		return
	}
	const delegate = revokeTarget.value
	revokeTarget.value = null
	try {
		const url = delegate.url
		if (!url) {
			showError(t('calendar', 'Could not revoke access.'))
			logger.error('Failed to revoke delegate access, no delegate url')
			return
		}
		await delegationStore.removeDelegate({ principalUrl: url })
		showSuccess(t('calendar', 'Access revoked successfully.'))
	} catch (error) {
		logger.error('Failed to revoke delegate access', { error })
		showError(t('calendar', 'Could not revoke access.'))
	}
}

/**
 * Open the add-delegate dialog.
 */
function openAddDelegate(): void {
	selectedUser.value = null
	searchResults.value = []
	showAddDelegate.value = true
}

/**
 * Handle the add-delegate dialog close event.
 *
 * @param open - New open state
 */
function onAddDelegateDialogClose(open: boolean): void {
	if (!open) {
		showAddDelegate.value = false
	}
}

/**
 * Execute the add-delegate operation.
 *
 * @param permission - The permission level to grant
 */
async function confirmAddDelegate(permission: 'write' | 'read'): Promise<void> {
	if (!selectedUser.value) {
		return
	}
	addLoading.value = true
	const user = selectedUser.value
	showAddDelegate.value = false
	try {
		await delegationStore.addDelegate({ principalUrl: user.url, permission })
		const label = permission === 'read'
			? t('calendar', '{name} can now view your calendars.', { name: user.displayname || user.principalId || '' })
			: t('calendar', '{name} can now act on your behalf.', { name: user.displayname || user.principalId || '' })
		showSuccess(label)
	} catch (error) {
		logger.error('Failed to add delegate', { error })
		showError(t('calendar', 'Could not add delegate.'))
	} finally {
		addLoading.value = false
		selectedUser.value = null
	}
}

/**
 * Filter function for NcSelect to match against displayname, email, or principalId.
 *
 * @param option - The option object
 * @param label - The label value
 * @param search - The current search term
 */
function filterSearchResults(option: SearchUser, label: string, search: string): boolean {
	if (!search) {
		return true
	}
	const term = search.toLowerCase()
	return (!!label && label.toLowerCase().includes(term))
		|| (!!option.emailAddress && option.emailAddress.toLowerCase().includes(term))
		|| (!!option.principalId && option.principalId.toLowerCase().includes(term))
}

/**
 * Search for users by display name or email.
 */
const onSearch = debounce(async (query: string): Promise<void> => {
	if (!query) {
		searchResults.value = []
		return
	}

	searchLoading.value = true
	try {
		const results = await principalPropertySearchByDisplaynameOrEmail(query)
		const currentUser = principalsStore.getCurrentUserPrincipal
		const existingDelegateUrls = delegationStore.delegates.map((d) => d.url)

		searchResults.value = results
			.filter((result: Record<string, unknown>) => {
				// Only include individual users (not rooms/resources/groups)
				if (result.calendarUserType !== 'INDIVIDUAL') {
					return false
				}
				// Exclude the current user
				if (currentUser && result.principalUrl === currentUser.url) {
					return false
				}
				// Exclude already-existing delegates (both editors and viewers)
				if (existingDelegateUrls.includes(result.principalUrl as string)) {
					return false
				}
				return true
			})
			.map((result: Record<string, unknown>) => ({
				url: result.principalUrl as string,
				displayname: result.displayname as string | null,
				emailAddress: result.email as string | null,
				principalId: result.userId as string | null,
			}))
	} catch (error) {
		logger.error('User search failed', { error })
		searchResults.value = []
	} finally {
		searchLoading.value = false
	}
}, 300)
</script>

<style lang="scss" scoped>
.delegation-settings {
	&__loading {
		margin-top: calc(var(--default-grid-baseline) * 3);
	}

	&__list {
		list-style: none;
		padding: 0;
		margin: 0 0 calc(var(--default-grid-baseline) * 2);
	}

	&__empty {
		color: var(--color-text-maxcontrast);
		font-style: italic;
		margin: calc(var(--default-grid-baseline) * 2) 0;
	}

	&__add-button {
		margin-top: calc(var(--default-grid-baseline) * 3);
	}
}

.delegation-add {
	padding: var(--default-grid-baseline) 0;

	&__select {
		width: 100%;
	}

	&__description {
		margin-top: calc(var(--default-grid-baseline) * 3);
		color: var(--color-text-maxcontrast);
	}

	&__option {
		display: flex;
		align-items: center;
		gap: calc(var(--default-grid-baseline) * 2);
		width: 100%;
	}

	&__option-label {
		display: flex;
		flex-direction: column;
	}

	&__option-email {
		color: var(--color-text-lighter);
	}
}
</style>

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
			:description="t('calendar', 'Allow users to view your calendars, or manage events and invitations on your behalf.')">
			<NcEmptyContent
				v-if="loading"
				icon="icon-loading"
				class="delegation-settings__loading"
				:description="t('calendar', 'Loading delegates\u2026')" />
			<ul v-else class="delegation-settings__list">
				<NcListItem
					v-for="delegate in delegationStore.delegates"
					:key="delegate.url"
					:name="delegate.displayname || delegate.principalId"
					:subname="accessLabel(delegate.access)"
					:compact="true">
					<template #actions>
						<NcActionButton
							v-if="delegate.access === 'read'"
							:aria-label="t('calendar', 'Allow editing')"
							@click="onChangeAccess(delegate, 'write')">
							<template #icon>
								<PencilIcon :size="20" />
							</template>
							{{ t('calendar', 'Allow editing') }}
						</NcActionButton>
						<NcActionButton
							v-else
							:aria-label="t('calendar', 'Restrict to view only')"
							@click="onChangeAccess(delegate, 'read')">
							<template #icon>
								<EyeIcon :size="20" />
							</template>
							{{ t('calendar', 'Restrict to view only') }}
						</NcActionButton>
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
				<fieldset class="delegation-add__access">
					<legend class="delegation-add__access-legend">
						{{ t('calendar', 'Access level') }}
					</legend>
					<NcCheckboxRadioSwitch
						v-model="selectedAccess"
						value="write"
						name="delegation-access"
						type="radio">
						{{ t('calendar', 'Can edit (manage events on your behalf)') }}
					</NcCheckboxRadioSwitch>
					<NcCheckboxRadioSwitch
						v-model="selectedAccess"
						value="read"
						name="delegation-access"
						type="radio">
						{{ t('calendar', 'Can view only') }}
					</NcCheckboxRadioSwitch>
				</fieldset>
			</div>
			<template #actions>
				<NcButton variant="secondary" @click="showAddDelegate = false">
					{{ t('calendar', 'Cancel') }}
				</NcButton>
				<NcButton
					variant="primary"
					:disabled="!selectedUser || addLoading"
					@click="confirmAddDelegate">
					{{ t('calendar', 'Add') }}
				</NcButton>
			</template>
		</NcDialog>
	</div>
</template>

<script>
import { showError, showSuccess } from '@nextcloud/dialogs'
import {
	NcActionButton,
	NcAvatar,
	NcButton,
	NcCheckboxRadioSwitch,
	NcDialog,
	NcEmptyContent,
	NcFormGroup,
	NcListItem,
	NcNoteCard,
	NcSelect,
} from '@nextcloud/vue'
import debounce from 'debounce'
import { mapStores } from 'pinia'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import EyeIcon from 'vue-material-design-icons/EyeOutline.vue'
import PencilIcon from 'vue-material-design-icons/PencilOutline.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService.js'
import useDelegationStore from '../../../store/delegation.js'
import usePrincipalsStore from '../../../store/principals.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'SettingsDelegationSection',

	components: {
		NcActionButton,
		NcAvatar,
		NcButton,
		NcCheckboxRadioSwitch,
		NcDialog,
		NcEmptyContent,
		NcFormGroup,
		NcListItem,
		NcNoteCard,
		NcSelect,
		CloseIcon,
		EyeIcon,
		PencilIcon,
		PlusIcon,
	},

	data() {
		return {
			/** Whether the data is being loaded */
			loading: false,
			/** Whether there was an error loading delegates */
			loadError: false,
			/** The delegate object pending revocation, or null */
			revokeTarget: null,
			/** Whether the add-delegate dialog is open */
			showAddDelegate: false,
			/** Currently selected user in the add-delegate dialog */
			selectedUser: null,
			/** Access level chosen in the add-delegate dialog */
			selectedAccess: 'write',
			/** Search results for user lookup */
			searchResults: [],
			/** Whether user search is in progress */
			searchLoading: false,
			/** Whether an add-delegate operation is in progress */
			addLoading: false,
		}
	},

	computed: {
		...mapStores(useDelegationStore, usePrincipalsStore),

		/**
		 * Confirmation message for the revoke dialog.
		 *
		 * @return {string}
		 */
		revokeMessage() {
			if (!this.revokeTarget) {
				return ''
			}
			const email = this.revokeTarget.emailAddress
				|| this.revokeTarget.displayname
				|| this.revokeTarget.principalId
			return this.t('calendar', '{email} will no longer be able to act on your behalf.', { email })
		},

		/**
		 * Buttons for the revoke confirmation dialog.
		 *
		 * @return {object[]}
		 */
		revokeButtons() {
			return [
				{
					label: this.t('calendar', 'Cancel'),
					callback: () => { this.revokeTarget = null },
				},
				{
					label: this.t('calendar', 'Revoke'),
					type: 'error',
					callback: this.confirmRevoke,
				},
			]
		},

	},

	async created() {
		this.loadError = false
		this.loading = true
		try {
			await this.delegationStore.fetchDelegates()
		} catch (error) {
			logger.error('Failed to load delegates', { error })
			this.loadError = true
		} finally {
			this.loading = false
		}
	},

	methods: {
		/**
		 * Open the revoke confirmation dialog for a specific delegate.
		 *
		 * @param {object} delegate The delegate principal object
		 */
		onRevokeClick(delegate) {
			this.revokeTarget = delegate
		},

		/**
		 * Handle the revoke dialog close event.
		 *
		 * @param {boolean} open New open state
		 */
		onRevokeDialogClose(open) {
			if (!open) {
				this.revokeTarget = null
			}
		},

		/**
		 * Execute the revoke operation after user confirmation.
		 */
		async confirmRevoke() {
			if (!this.revokeTarget) {
				return
			}
			const delegate = this.revokeTarget
			this.revokeTarget = null
			try {
				await this.delegationStore.removeDelegate({
					principalUrl: delegate.url,
					access: delegate.access,
				})
				showSuccess(this.t('calendar', 'Access revoked successfully.'))
			} catch (error) {
				logger.error('Failed to revoke delegate access', { error })
				showError(this.t('calendar', 'Could not revoke access.'))
			}
		},

		/**
		 * Open the add-delegate dialog.
		 */
		openAddDelegate() {
			this.selectedUser = null
			this.selectedAccess = 'write'
			this.searchResults = []
			this.showAddDelegate = true
		},

		/**
		 * Human-readable label for an access level.
		 *
		 * @param {'read'|'write'} access The access level
		 * @return {string}
		 */
		accessLabel(access) {
			return access === 'read'
				? this.t('calendar', 'View only')
				: this.t('calendar', 'Can edit')
		},

		/**
		 * Promote or demote a delegate's access level.
		 *
		 * @param {object} delegate The delegate to change
		 * @param {'read'|'write'} newAccess The new access level
		 */
		async onChangeAccess(delegate, newAccess) {
			if (delegate.access === newAccess) {
				return
			}
			try {
				await this.delegationStore.addDelegate({
					principalUrl: delegate.url,
					access: newAccess,
					from: delegate.access,
				})
				showSuccess(newAccess === 'write'
					? this.t('calendar', 'Editing access granted.')
					: this.t('calendar', 'Access restricted to view only.'),
				)
			} catch (error) {
				logger.error('Failed to change delegate access', { error })
				showError(this.t('calendar', 'Could not update access.'))
			}
		},

		/**
		 * Handle the add-delegate dialog close event.
		 *
		 * @param {boolean} open New open state
		 */
		onAddDelegateDialogClose(open) {
			if (!open) {
				this.showAddDelegate = false
			}
		},

		/**
		 * Execute the add-delegate operation.
		 */
		async confirmAddDelegate() {
			if (!this.selectedUser) {
				return
			}
			this.addLoading = true
			const user = this.selectedUser
			const access = this.selectedAccess
			this.showAddDelegate = false
			try {
				await this.delegationStore.addDelegate({ principalUrl: user.url, access })
				const name = user.displayname || user.principalId
				showSuccess(access === 'write'
					? this.t('calendar', '{name} can now act on your behalf.', { name })
					: this.t('calendar', '{name} can now view your calendars.', { name }),
				)
			} catch (error) {
				logger.error('Failed to add delegate', { error })
				showError(this.t('calendar', 'Could not add delegate.'))
			} finally {
				this.addLoading = false
				this.selectedUser = null
			}
		},

		/**
		 * Filter function for NcSelect to match against displayname, email, or principalId.
		 *
		 * @param {object} option The option object
		 * @param {string} label The label value
		 * @param {string} search The current search term
		 * @return {boolean}
		 */
		filterSearchResults(option, label, search) {
			if (!search) {
				return true
			}
			const term = search.toLowerCase()
			return (label && label.toLowerCase().includes(term))
				|| (option.emailAddress && option.emailAddress.toLowerCase().includes(term))
				|| (option.principalId && option.principalId.toLowerCase().includes(term))
		},

		/**
		 * Search for users by display name or email.
		 */
		onSearch: debounce(async function(query) {
			if (!query) {
				this.searchResults = []
				return
			}

			this.searchLoading = true
			try {
				const results = await principalPropertySearchByDisplaynameOrEmail(query)
				const currentUser = this.principalsStore.getCurrentUserPrincipal
				const existingDelegateUrls = this.delegationStore.delegates.map((d) => d.url)

				this.searchResults = results
					.filter((result) => {
						// Only include individual users (not rooms/resources/groups)
						if (result.calendarUserType !== 'INDIVIDUAL') {
							return false
						}
						// Exclude the current user
						if (currentUser && result.principalUrl === currentUser.url) {
							return false
						}
						// Exclude already-existing delegates
						if (existingDelegateUrls.includes(result.principalUrl)) {
							return false
						}
						return true
					})
					.map((result) => ({
						url: result.principalUrl,
						displayname: result.displayname,
						emailAddress: result.email,
						principalId: result.userId,
					}))
			} catch (error) {
				logger.error('User search failed', { error })
				this.searchResults = []
			} finally {
				this.searchLoading = false
			}
		}, 300),
	},
}
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

	&__access {
		margin-top: calc(var(--default-grid-baseline) * 3);
		border: none;
		padding: 0;
	}

	&__access-legend {
		font-weight: bold;
		margin-bottom: var(--default-grid-baseline);
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

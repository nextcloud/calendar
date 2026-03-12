<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcAppNavigationItem
		:name="t('calendar', 'Delegation')"
		:pinned="true"
		@click.prevent="openModal">
		<template #icon>
			<AccountArrowRightIcon :size="20" decorative />
		</template>
		<template #extra>
			<!-- Main Delegation Modal -->
			<NcModal
				v-if="showModal"
				size="normal"
				:name="t('calendar', 'Delegation')"
				@close="closeModal">
				<div class="delegation-modal">
					<h2 class="delegation-modal__title">
						{{ t('calendar', 'Delegation') }}
					</h2>

					<NcNoteCard v-if="loadError" type="error">
						{{ t('calendar', 'Could not load delegates.') }}
					</NcNoteCard>

					<NcFormGroup
						:label="t('calendar', 'Delegates')"
						:description="t('calendar', 'Allow users to manage your calendar events and invitations on your behalf.')">
						<NcEmptyContent
							v-if="loading"
							icon="icon-loading"
							class="delegation-modal__loading"
							:description="t('calendar', 'Loading delegates\u2026')" />
						<ul v-else class="delegation-modal__list">
							<NcListItem
								v-for="delegate in delegationStore.delegates"
								:key="delegate.url"
								:name="delegate.displayname || delegate.principalId"
								:subname="delegate.emailAddress"
								:compact="true">
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

						<p v-if="!loading && delegationStore.delegates.length === 0" class="delegation-modal__empty">
							{{ t('calendar', 'No delegates yet.') }}
						</p>

						<NcButton
							class="delegation-modal__add-button"
							variant="secondary"
							@click="openAddDelegate">
							<template #icon>
								<PlusIcon :size="20" />
							</template>
							{{ t('calendar', 'Add delegate') }}
						</NcButton>
					</NcFormGroup>
				</div>
			</NcModal>

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
				:buttons="addDelegateButtons"
				@update:open="onAddDelegateDialogClose">
				<div class="delegation-add">
					<NcSelect
						v-model="selectedUser"
						:options="searchResults"
						:searchable="true"
						:internalSearch="false"
						:loading="searchLoading"
						:max-height="300"
						:placeholder="t('calendar', 'Search for a user\u2026')"
						:inputLabel="t('calendar', 'Select a user')"
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
						{{ t('calendar', 'They will be able to manage your calendar events and invitations on your behalf.') }}
					</p>
				</div>
			</NcDialog>
		</template>
	</NcAppNavigationItem>
</template>

<script>
import { showError, showSuccess } from '@nextcloud/dialogs'
import {
	NcActionButton,
	NcAppNavigationItem,
	NcAvatar,
	NcButton,
	NcDialog,
	NcEmptyContent,
	NcFormGroup,
	NcListItem,
	NcModal,
	NcNoteCard,
	NcSelect,
} from '@nextcloud/vue'
import debounce from 'debounce'
import { mapStores } from 'pinia'
import AccountArrowRightIcon from 'vue-material-design-icons/AccountArrowRight.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import { principalPropertySearchByDisplaynameOrEmail } from '../../services/caldavService.js'
import useDelegationStore from '../../store/delegation.js'
import usePrincipalsStore from '../../store/principals.js'
import logger from '../../utils/logger.js'

export default {
	name: 'Delegation',

	components: {
		NcAppNavigationItem,
		NcModal,
		NcFormGroup,
		NcListItem,
		NcButton,
		NcEmptyContent,
		NcNoteCard,
		NcActionButton,
		NcDialog,
		NcSelect,
		NcAvatar,
		AccountArrowRightIcon,
		CloseIcon,
		PlusIcon,
	},

	data() {
		return {
			/** Whether the main delegation modal is open */
			showModal: false,
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

		/**
		 * Buttons for the add-delegate dialog.
		 *
		 * @return {object[]}
		 */
		addDelegateButtons() {
			return [
				{
					label: this.t('calendar', 'Cancel'),
					callback: () => { this.showAddDelegate = false },
				},
				{
					label: this.t('calendar', 'Add'),
					type: 'primary',
					disabled: !this.selectedUser || this.addLoading,
					callback: this.confirmAddDelegate,
				},
			]
		},
	},

	methods: {
		/**
		 * Open the main delegation modal and load delegates.
		 */
		async openModal() {
			this.showModal = true
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

		/**
		 * Close the main delegation modal.
		 */
		closeModal() {
			this.showModal = false
		},

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
				await this.delegationStore.removeDelegate({ principalUrl: delegate.url })
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
			this.searchResults = []
			this.showAddDelegate = true
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
			this.showAddDelegate = false
			try {
				await this.delegationStore.addDelegate({ principalUrl: user.url })
				showSuccess(this.t('calendar', '{name} can now act on your behalf.', { name: user.displayname || user.principalId }))
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
.delegation-modal {
	padding: calc(var(--default-grid-baseline) * 5) calc(var(--default-grid-baseline) * 6);

	&__title {
		margin-top: 0;
		margin-bottom: calc(var(--default-grid-baseline) * 4);
	}

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
		font-size: 0.85em;
	}
}
</style>

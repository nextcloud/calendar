<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="save-buttons">
		<NcButton
			v-if="showMoreButton"
			:type="moreButtonType"
			:disabled="disabled"
			@click="showMore">
			{{ $t('calendar', 'More details') }}
		</NcButton>
		<NcButton
			v-if="showSaveButton"
			variant="primary"
			:disabled="disabled"
			@click="saveOccurrence">
			<template #icon>
				<CheckIcon :size="20" />
			</template>
			{{ $t('calendar', 'Save') }}
		</NcButton>
		<NcButton
			v-if="showUpdateButton"
			variant="primary"
			:disabled="disabled"
			@click="saveOccurrence">
			<template #icon>
				<CheckIcon :size="20" />
			</template>
			{{ $t('calendar', 'Update') }}
		</NcButton>
		<NcButton
			v-if="showUpdateSeriesButton"
			variant="primary"
			:disabled="disabled"
			@click="saveSeries">
			{{ $t('calendar', 'Update entire series') }}
		</NcButton>
		<NcButton
			v-if="showUpdateFutureButton"
			variant="primary"
			:disabled="disabled"
			@click="saveFuture">
			{{ $t('calendar', 'Update this and future occurrences') }}
		</NcButton>
		<NcActions v-if="showUpdateMenu" :primary="true" :menuName="t('calendar', 'Update')">
			<template #icon>
				<CheckIcon :size="20" />
			</template>
			<NcActionButton v-if="canUpdateSeries" @click="saveSeries">
				<template #icon>
					<CheckIcon :size="20" />
				</template>
				{{ $t('calendar', 'Update entire series') }}
			</NcActionButton>
			<NcActionButton v-if="canUpdateFuture" @click="saveFuture">
				<template #icon>
					<CheckAllIcon :size="20" />
				</template>
				{{ $t('calendar', 'Update this and future occurrences') }}
			</NcActionButton>
			<NcActionButton v-if="canUpdateOccurrence" @click="saveOccurrence">
				<template #icon>
					<CheckIcon :size="20" />
				</template>
				{{ $t('calendar', 'Update this occurrence') }}
			</NcActionButton>
		</NcActions>

		<!-- Allow additional buttons -->
		<slot />
	</div>
</template>

<script>
import { NcActionButton, NcActions, NcButton } from '@nextcloud/vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CheckAllIcon from 'vue-material-design-icons/CheckAll.vue'

export default {
	name: 'SaveButtons',
	components: {
		NcButton,
		CheckIcon,
		CheckAllIcon,
		NcActions,
		NcActionButton,
	},

	props: {
		canUpdateOccurrence: {
			type: Boolean,
			required: true,
		},

		canUpdateFuture: {
			type: Boolean,
			required: true,
		},

		canUpdateSeries: {
			type: Boolean,
			required: true,
		},

		isNew: {
			type: Boolean,
			required: true,
		},

		isReadOnly: {
			type: Boolean,
			required: true,
		},

		showMoreButton: {
			type: Boolean,
			default: false,
		},

		moreButtonType: {
			type: String,
			default: undefined,
		},

		disabled: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['saveOccurrence', 'saveFuture', 'saveSeries', 'showMore'],

	computed: {
		showSaveButton() {
			return !this.isReadOnly && this.isNew
		},

		showUpdateButton() {
			return !this.isReadOnly && !this.isNew && this.allowedUpdateScopeCount === 1 && this.canUpdateOccurrence
		},

		allowedUpdateScopeCount() {
			return [this.canUpdateOccurrence, this.canUpdateFuture, this.canUpdateSeries].filter(Boolean).length
		},

		showUpdateFutureButton() {
			return !this.isReadOnly && !this.isNew && this.allowedUpdateScopeCount === 1 && this.canUpdateFuture
		},

		showUpdateSeriesButton() {
			return !this.isReadOnly && !this.isNew && this.allowedUpdateScopeCount === 1 && this.canUpdateSeries
		},

		showUpdateMenu() {
			return !this.isReadOnly && !this.isNew && this.allowedUpdateScopeCount > 1
		},
	},

	methods: {
		saveOccurrence() {
			this.$emit('saveOccurrence')
		},

		saveFuture() {
			this.$emit('saveFuture')
		},

		saveSeries() {
			this.$emit('saveSeries')
		},

		showMore() {
			this.$emit('showMore')
		},
	},
}
</script>

<style lang="scss" scoped>
.save-buttons {
	display: flex;
	justify-content: end;
	gap: var(--default-grid-baseline);
}
</style>

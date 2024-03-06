<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div class="save-buttons" :class="{ 'save-buttons--grow': growHorizontally }">
		<NcButton v-if="showMoreButton"
			:type="moreButtonType"
			:disabled="disabled"
			@click="showMore">
			{{ $t('calendar', 'More details') }}
		</NcButton>
		<NcButton v-if="showSaveButton"
			type="primary"
			:disabled="disabled"
			@click="saveThisOnly">
			<template #icon>
				<CheckIcon :size="20" />
			</template>
			{{ $t('calendar', 'Save') }}
		</NcButton>
		<NcButton v-if="showUpdateButton"
			type="primary"
			:disabled="disabled"
			@click="saveThisOnly">
			<template #icon>
				<CheckIcon :size="20" />
			</template>
			{{ $t('calendar', 'Update') }}
		</NcButton>
		<NcButton v-if="showUpdateThisAndFutureButton"
			:type="forceThisAndAllFuture ? 'primary' : 'secondary'"
			:disabled="disabled"
			@click="saveThisAndAllFuture">
			{{ $t('calendar', 'Update this and all future') }}
		</NcButton>
		<NcButton v-if="showUpdateOnlyThisButton"
			type="primary"
			:disabled="disabled"
			@click="saveThisOnly">
			{{ $t('calendar', 'Update this occurrence') }}
		</NcButton>

		<!-- Allow additional buttons -->
		<slot />
	</div>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'

export default {
	name: 'SaveButtons',
	components: {
		NcButton,
		CheckIcon,
	},
	props: {
		canCreateRecurrenceException: {
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
		forceThisAndAllFuture: {
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
		growHorizontally: {
			type: Boolean,
			default: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		showSaveButton() {
			return !this.isReadOnly && this.isNew && !this.canCreateRecurrenceException
		},
		showUpdateButton() {
			return !this.isReadOnly && !this.isNew && !this.canCreateRecurrenceException
		},
		showUpdateOnlyThisButton() {
			return !this.isReadOnly && this.canCreateRecurrenceException && !this.forceThisAndAllFuture
		},
		showUpdateThisAndFutureButton() {
			return !this.isReadOnly && this.canCreateRecurrenceException
		},
	},
	methods: {
		saveThisOnly() {
			this.$emit('save-this-only')
		},
		saveThisAndAllFuture() {
			this.$emit('save-this-and-all-future')
		},
		showMore() {
			this.$emit('show-more')
		},
	},
}
</script>

<style lang="scss" scoped>
.save-buttons {
	display: flex;
	justify-content: end;
	gap: 5px;

	&--grow {
		flex-wrap: wrap;

		button {
			flex: 1 fit-content;
		}
	}
}
</style>

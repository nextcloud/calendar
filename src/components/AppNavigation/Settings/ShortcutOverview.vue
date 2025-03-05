<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcDialog size="large"
		:name="$t('calendar', 'Shortcut overview')"
		:close-on-click-outside="true"
		@update:open="onUpdateOpen">
		<div class="shortcut-overview-modal">
			<section v-for="category in shortcuts"
				:key="category.categoryId"
				class="shortcut-section">
				<h3 class="shortcut-section__header">
					{{ category.categoryLabel }}
				</h3>
				<div v-for="(shortcut, index) in category.shortcuts"
					:key="`${category.categoryId}-${index}`"
					class="shortcut-section-item">
					<span class="shortcut-section-item__keys">
						<template v-for="(keyCombination, index2) of shortcut.keys">
							<template v-for="(key, index3) in keyCombination">
								<kbd :key="`${category.categoryId}-${index}-${index2}-${index3}`">{{ key }}</kbd>
								<span v-if="index3 !== (keyCombination.length - 1)"
									:key="`${category.categoryId}-${index}-${index2}-${index3}`"
									class="shortcut-section-item__spacer">
									+
								</span>
							</template>
							<span v-if="index2 !== (shortcut.keys.length - 1)"
								:key="`${category.categoryId}-${index}-${index2}`"
								class="shortcut-section-item__spacer">
								{{ $t('calendar', 'or') }}
							</span>
						</template>
					</span>
					<span class="shortcut-section-item__label">{{ shortcut.label }}</span>
				</div>
			</section>
		</div>
	</NcDialog>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { NcDialog } from '@nextcloud/vue'

export default {
	components: {
		NcDialog,
	},
	computed: {
		shortcuts() {
			return [{
				categoryId: 'navigation',
				categoryLabel: t('calendar', 'Navigation'),
				shortcuts: [{
					keys: [['p'], ['k']],
					label: t('calendar', 'Previous period'),
				}, {
					keys: [['n'], ['j']],
					label: t('calendar', 'Next period'),
				}, {
					keys: [['t']],
					label: t('calendar', 'Today'),
				}],
			}, {
				categoryId: 'views',
				categoryLabel: t('calendar', 'Views'),
				shortcuts: [{
					keys: [['1'], ['d']],
					label: t('calendar', 'Day view'),
				}, {
					keys: [['2'], ['w']],
					label: t('calendar', 'Week view'),
				}, {
					keys: [['3'], ['m']],
					label: t('calendar', 'Month view'),
				}, {
					keys: [['4'], ['y']],
					label: t('calendar', 'Year view'),
				}, {
					keys: [['5'], ['l']],
					label: t('calendar', 'List view'),
				}],
			}, {
				categoryId: 'actions',
				categoryLabel: t('calendar', 'Actions'),
				shortcuts: [{
					keys: [['c']],
					label: t('calendar', 'Create event'),
				}, {
					keys: [['h']],
					label: t('calendar', 'Show shortcuts'),
				}],
			}, {
				categoryId: 'editor',
				categoryLabel: t('calendar', 'Editor'),
				shortcuts: [{
					keys: [['Escape']],
					label: t('calendar', 'Close editor'),
				}, {
					keys: [['Ctrl+Enter']],
					label: t('calendar', 'Save edited event'),
				}, {
					keys: [['Ctrl+Delete']],
					label: t('calendar', 'Delete edited event'),
				}, {
					keys: [['Ctrl+d']],
					label: t('calendar', 'Duplicate event'),
				}],
			}]
		},
	},
	methods: {
		onUpdateOpen(open) {
			if (!open) {
				this.$emit('close')
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.shortcut-overview-modal {
	display: flex;
	flex-wrap: wrap;

	.shortcut-section {
		width: 50%;
		min-width: 425px;
		flex-grow: 0;
		flex-shrink: 0;
		padding: 10px;
		box-sizing: border-box;

		.shortcut-section-item {
			width: 100%;
			display: grid;
			grid-template-columns: 33% 67%;
			column-gap: 10px;

			&:not(:first-child) {
				margin-top: 10px;
			}

			&__keys {
				display: block;
				text-align: right;
			}

			&__label {
				display: block;
				text-align: left;
				padding-top: 5px;
			}

			&__spacer {
				margin: 0 3px;
			}
		}
	}
}
</style>

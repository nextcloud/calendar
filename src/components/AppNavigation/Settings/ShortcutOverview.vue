<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcAppSettingsShortcutsSection>
		<NcHotkeyList
			v-for="category in shortcuts"
			:key="category.categoryId"
			:label="category.categoryLabel">
			<NcHotkey
				v-for="(shortcut, index) in category.shortcuts"
				:key="`${category.categoryId}-${index}`"
				:hotkey="shortcut.or ? null : shortcut.keys[0]"
				:label="shortcut.label">
				<template v-if="shortcut.or" #hotkey>
					<div class="shortcut-section-item__keys">
						<div v-for="(key, keyIndex) in shortcut.keys" :key="keyIndex">
							<NcKbd :symbol="key" />
							<span
								v-if="keyIndex !== (shortcut.keys.length - 1)">
								{{ $t('calendar', 'or') }}
							</span>
						</div>
					</div>
				</template>
			</NcHotkey>
		</NcHotkeyList>
	</NcAppSettingsShortcutsSection>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { NcAppSettingsShortcutsSection, NcHotkey, NcHotkeyList } from '@nextcloud/vue'
import NcKbd from '@nextcloud/vue/components/NcKbd'

export default {
	name: 'ShortcutOverview',

	components: {
		NcAppSettingsShortcutsSection,
		NcHotkeyList,
		NcHotkey,
		NcKbd,
	},

	computed: {
		shortcuts() {
			return [{
				categoryId: 'navigation',
				categoryLabel: t('calendar', 'Navigation'),
				shortcuts: [{
					keys: ['P', 'K'],
					label: t('calendar', 'Previous period'),
					or: true,
				}, {
					keys: ['N', 'J'],
					label: t('calendar', 'Next period'),
					or: true,
				}, {
					keys: ['T'],
					label: t('calendar', 'Today'),
					or: true,
				}],
			}, {
				categoryId: 'views',
				categoryLabel: t('calendar', 'Views'),
				shortcuts: [{
					keys: ['1', 'D'],
					label: t('calendar', 'Day view'),
					or: true,
				}, {
					keys: ['2', 'W'],
					label: t('calendar', 'Week view'),
					or: true,
				}, {
					keys: ['3', 'M'],
					label: t('calendar', 'Month view'),
					or: true,
				}, {
					keys: ['4', 'Y'],
					label: t('calendar', 'Year view'),
					or: true,
				}, {
					keys: ['5', 'L'],
					label: t('calendar', 'List view'),
					or: true,
				}],
			}, {
				categoryId: 'actions',
				categoryLabel: t('calendar', 'Actions'),
				shortcuts: [{
					keys: ['C'],
					label: t('calendar', 'Create event'),
				}, {
					keys: ['H'],
					label: t('calendar', 'Show shortcuts'),
				}],
			}, {
				categoryId: 'editor',
				categoryLabel: t('calendar', 'Editor'),
				shortcuts: [{
					keys: ['Escape'],
					label: t('calendar', 'Close editor'),
				}, {
					keys: ['Control Enter'],
					label: t('calendar', 'Save edited event'),
				}, {
					keys: ['Control Delete'],
					label: t('calendar', 'Delete edited event'),
				}, {
					keys: ['Control D'],
					label: t('calendar', 'Duplicate event'),
				}],
			}]
		},
	},
}
</script>

<style lang="scss" scoped>
.shortcut-section-item__keys {
	display: flex;
	gap: var(--default-grid-baseline);
}
</style>

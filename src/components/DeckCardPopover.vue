<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="deck-card-popover" tabindex="-1" @keydown.esc="$emit('close')">
		<div class="deck-card-popover__top-actions">
			<NcActions>
				<NcActionButton @click="$emit('close')">
					<template #icon>
						<CloseIcon :size="20" />
					</template>
					{{ t('calendar', 'Close') }}
				</NcActionButton>
			</NcActions>
		</div>

		<div class="deck-card-popover__header">
			<CalendarPickerHeader
				:value="boardAsCalendar"
				:calendars="[boardAsCalendar]"
				:isReadOnly="true"
				:isViewedByAttendee="false" />
			<PropertyTitle :value="card.title" :isReadOnly="true" />
		</div>

		<div class="deck-card-popover__content">
			<div v-if="dueDate" class="deck-card-popover__row">
				<CalendarIcon :size="20" :name="t('calendar', 'Due date')" />
				<span>{{ dueDate }}</span>
			</div>

			<div v-if="labels.length" class="deck-card-popover__row">
				<TagIcon :size="20" :name="t('calendar', 'Labels')" />
				<ul class="deck-card-popover__labels">
					<li
						v-for="label in labels"
						:key="label.title"
						class="deck-card-popover__label"
						:style="label.style">
						{{ label.title }}
					</li>
				</ul>
			</div>

			<div v-if="assignees.length" class="deck-card-popover__row">
				<AccountMultipleIcon :size="20" :name="t('calendar', 'Assigned to')" />
				<ul class="deck-card-popover__assignees">
					<li v-for="assignee in assignees" :key="assignee.uid">
						<NcAvatar
							:user="assignee.uid"
							:displayName="assignee.displayname"
							hideStatus
							:size="24" />
					</li>
				</ul>
			</div>

			<div v-if="card.description" class="deck-card-popover__row">
				<TextBoxIcon :size="20" :name="t('calendar', 'Description')" />
				<NcRichText
					class="deck-card-popover__description"
					:text="card.description"
					:useMarkdown="true"
					:useExtendedMarkdown="true" />
			</div>
		</div>

		<div class="deck-card-popover__footer">
			<NcButton :href="boardUrl">
				{{ t('calendar', 'Show board') }}
			</NcButton>
			<NcButton :href="cardUrl">
				<template #icon>
					<EditIcon :size="20" />
				</template>
				{{ t('calendar', 'Edit') }}
			</NcButton>
		</div>
	</div>
</template>

<script>
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { NcActionButton, NcActions, NcAvatar, NcButton, NcRichText } from '@nextcloud/vue'
import { mapState } from 'pinia'
import AccountMultipleIcon from 'vue-material-design-icons/AccountMultipleOutline.vue'
import CalendarIcon from 'vue-material-design-icons/CalendarBlankOutline.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import EditIcon from 'vue-material-design-icons/PencilOutline.vue'
import TagIcon from 'vue-material-design-icons/TagOutline.vue'
import TextBoxIcon from 'vue-material-design-icons/TextBoxOutline.vue'
import CalendarPickerHeader from '@/components/Editor/CalendarPickerHeader.vue'
import PropertyTitle from '@/components/Editor/Properties/PropertyTitle.vue'
import dateFormat from '@/filters/dateFormat.js'
import useSettingsStore from '@/store/settings.js'
import { generateTextColorForRGB } from '@/utils/color.js'

export default {
	name: 'DeckCardPopover',

	components: {
		AccountMultipleIcon,
		CalendarIcon,
		CalendarPickerHeader,
		CloseIcon,
		EditIcon,
		NcActionButton,
		NcActions,
		NcAvatar,
		NcButton,
		NcRichText,
		PropertyTitle,
		TagIcon,
		TextBoxIcon,
	},

	props: {
		/**
		 * The rich object of a resolved deck-card reference
		 */
		deckCard: {
			type: Object,
			required: true,
		},
	},

	emits: ['close'],

	computed: {
		...mapState(useSettingsStore, ['momentLocale']),

		card() {
			return this.deckCard.card
		},

		board() {
			return this.deckCard.board
		},

		boardAsCalendar() {
			return {
				displayName: this.board.title,
				color: `#${this.board.color}`,
			}
		},

		dueDate() {
			return this.card.duedate
				? dateFormat(new Date(this.card.duedate), false, this.momentLocale)
				: null
		},

		labels() {
			return (this.card.labels ?? []).map((label) => {
				const [red, green, blue] = label.color.match(/../g).map((part) => parseInt(part, 16))
				return {
					title: label.title,
					style: {
						backgroundColor: `#${label.color}`,
						color: generateTextColorForRGB({ red, green, blue }),
					},
				}
			})
		},

		assignees() {
			return (this.card.assignedUsers ?? []).map(({ participant }) => participant)
		},

		boardUrl() {
			return generateUrl('/apps/deck/board/{boardId}', { boardId: this.board.id })
		},

		cardUrl() {
			return generateUrl('/apps/deck/card/{cardId}', { cardId: this.card.id })
		},
	},

	methods: {
		t,
	},
}
</script>

<style lang="scss" scoped>
.deck-card-popover {
	position: relative;
	display: flex;
	flex-direction: column;
	min-height: 0;
	width: min(calc(var(--default-grid-baseline) * 120), calc(100vw - var(--default-grid-baseline) * 4));
	max-height: calc(100vh - var(--header-height) - var(--default-grid-baseline) * 8);
	box-sizing: border-box;
	padding-inline: calc(var(--default-grid-baseline) * 4) calc(var(--default-grid-baseline) * 2);
	padding-block: calc(var(--default-grid-baseline) * 2);

	&:focus {
		outline: none;
	}

	&__top-actions {
		position: absolute;
		top: var(--default-grid-baseline);
		inset-inline-end: var(--default-grid-baseline);
		z-index: 1;

		:deep(.button-vue--tertiary) {
			color: var(--color-text-maxcontrast);
		}
	}

	&__header {
		flex-shrink: 0;
		padding-inline-end: calc(var(--default-grid-baseline) * 4);
		padding-bottom: calc(var(--default-grid-baseline) * 2);

		:deep(.calendar-picker-header) {
			margin-inline-start: 0;
			margin-bottom: calc(var(--default-grid-baseline) * 2);

			&::after {
				content: '';
				flex: 0 0 calc(var(--default-grid-baseline) * 11);
			}
		}
	}

	&__content {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 4);
		padding-inline-end: calc(var(--default-grid-baseline) * 4);
		overflow-y: auto;
		min-height: 0;
	}

	&__row {
		display: flex;
		align-items: flex-start;
		gap: calc(var(--default-grid-baseline) * 4);
		overflow-wrap: anywhere;

		// Center the icon on the first line of text
		> .material-design-icon {
			flex-shrink: 0;
			align-self: flex-start;
			align-items: center;
			height: calc(var(--default-font-size) * var(--default-line-height));
		}
	}

	&__labels,
	&__assignees {
		display: flex;
		flex-wrap: wrap;
		gap: var(--default-grid-baseline);
	}

	&__label {
		padding: 0 calc(var(--default-grid-baseline) * 2);
		border-radius: var(--border-radius-pill);
		font-size: var(--font-size-small);
		line-height: calc(var(--default-grid-baseline) * 6);
	}

	&__description {
		min-width: 0;
	}

	&__footer {
		display: flex;
		flex-shrink: 0;
		justify-content: end;
		gap: var(--default-grid-baseline);
		padding-top: calc(var(--default-grid-baseline) * 2);
	}
}
</style>

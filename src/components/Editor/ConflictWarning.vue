<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcNoteCard v-if="conflicts.length > 0" type="warning" class="conflict-warning">
		<p class="conflict-warning__heading">
			{{ heading }}
		</p>
		<ul class="conflict-warning__list">
			<li v-for="conflict in conflicts" :key="conflict.key">
				{{ conflict.title }}<span class="conflict-warning__time">{{ formatRange(conflict) }}</span>
			</li>
		</ul>
		<p v-if="additionalCount > 0" class="conflict-warning__more">
			{{ n('calendar', '… and %n more event', '… and %n more events', additionalCount) }}
		</p>
		<NcButton
			v-if="!hideFindTime"
			variant="tertiary"
			class="conflict-warning__action"
			@click="$emit('showFreeBusy')">
			{{ t('calendar', 'Find a time') }}
		</NcButton>
	</NcNoteCard>
</template>

<script>
import { NcButton, NcNoteCard } from '@nextcloud/vue'
import logger from '@/utils/logger.js'

export default {
	name: 'ConflictWarning',
	components: {
		NcButton,
		NcNoteCard,
	},

	props: {
		/**
		 * The conflicting events to list, already limited by the caller.
		 */
		conflicts: {
			type: Array,
			required: true,
		},

		/**
		 * How many further conflicts exist beyond the listed ones.
		 */
		additionalCount: {
			type: Number,
			default: 0,
		},

		/**
		 * Total number of conflicts, used for the heading.
		 */
		totalCount: {
			type: Number,
			required: true,
		},

		/**
		 * IANA id of the timezone the times should be shown in. Without it the
		 * browser's own timezone is used, which is wrong whenever the user's
		 * calendar timezone differs from where they happen to be sitting.
		 */
		timezoneId: {
			type: String,
			default: null,
		},

		/**
		 * Hide the shortcut to the free/busy view. The full editor already has
		 * that button next to the attendee list, so a second one is a duplicate.
		 */
		hideFindTime: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['showFreeBusy'],
	computed: {
		heading() {
			return this.n(
				'calendar',
				'This overlaps an event already in your calendar',
				'This overlaps %n events already in your calendar',
				this.totalCount,
			)
		},
	},

	methods: {
		formatRange(conflict) {
			const options = { hour: 'numeric', minute: 'numeric' }
			if (this.timezoneId) {
				options.timeZone = this.timezoneId
			}
			let formatter
			try {
				formatter = new Intl.DateTimeFormat(undefined, options)
			} catch (error) {
				// An unknown timezone id must not break the warning.
				logger.debug('Falling back to the browser timezone for a conflict time', { error })
				formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: 'numeric' })
			}
			return ` (${formatter.format(conflict.start)}–${formatter.format(conflict.end)})`
		},
	},
}
</script>

<style lang="scss" scoped>
.conflict-warning {
	&__heading {
		font-weight: bold;
	}

	&__list {
		margin: 4px 0 0 0;
		padding-inline-start: 16px;
		list-style: disc;
	}

	&__time {
		color: var(--color-text-maxcontrast);
	}

	&__more {
		color: var(--color-text-maxcontrast);
	}

	&__action {
		margin-top: 4px;
	}
}
</style>

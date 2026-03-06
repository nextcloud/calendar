<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<a
		:href="richObject.url"
		class="event"
		target="_blank">
		<div class="event__image">
			<CalendarIcon :size="40" />
		</div>

		<div class="event__content">
			<div class="line-one">
				<strong class="title">{{ richObject.title }}</strong>
				<span class="separator">•</span>
				<span class="calendar-prefix">{{ t('calendar', 'In calendar') }}</span>
				<span v-if="calendarColor" class="color" :style="{ backgroundColor: calendarColor }" />
				<span class="name">{{ richObject.calendarName }}</span>
			</div>
			<div class="line-two" :title="dateTitle">
				{{ t('calendar', 'Start: {date}', { date: richObject.date }) }}
				<span v-if="duration" class="duration">
					<span class="separator">•</span>
					<span>{{ duration }}</span>
				</span>
			</div>
		</div>
	</a>
</template>

<script lang="ts">
import { n, t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { defineComponent } from 'vue'
import CalendarIcon from 'vue-material-design-icons/Calendar.vue'

export default defineComponent({
	name: 'EventReferenceWidget',

	components: {
		CalendarIcon,
	},

	props: {
		richObject: {
			type: Object,
			default: null,
		},
	},

	computed: {
		calendarColor(): string | null {
			return this.richObject?.calendarColor || null
		},

		dateTitle(): string | undefined {
			if (!this.richObject.startTimestamp) {
				return undefined
			}

			return moment(this.richObject.startTimestamp * 1000).format('LLLL')
		},

		duration(): string | null {
			const start: number | undefined = this.richObject.startTimestamp
			const end: number | undefined = this.richObject.endTimestamp
			if (!start || !end || end <= start) {
				return null
			}

			const dur = moment.duration(end - start, 'seconds')
			const days = Math.floor(dur.asDays())
			const hours = dur.hours()
			const minutes = dur.minutes()

			const parts: string[] = []
			if (days > 0) {
				parts.push(n('calendar', '%n day', '%n days', days))
			}
			if (hours > 0) {
				parts.push(n('calendar', '%n hour', '%n hours', hours))
			}
			if (minutes > 0) {
				parts.push(n('calendar', '%n minute', '%n minutes', minutes))
			}

			return parts.length > 0 ? parts.join(' ') : null
		},
	},

	methods: {
		t,
	},
})
</script>

<style lang="scss" scoped>
.event {
	width: 100%;
	padding-inline: 12px;
	display: flex;
	gap: 6px;
	text-decoration: none;
	color: var(--color-main-text);

	&__image {
		margin-inline-end: 12px;
		display: flex;
		align-items: center;
	}

	&__content {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;

		.separator {
			padding-inline: 6px;
			flex-shrink: 0;
		}

		.line-one {
			display: flex;
			align-items: center;

			.title {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}

			.calendar-prefix {
				white-space: nowrap;
			}

			.color {
				display: inline-block;
				width: 14px;
				height: 14px;
				border-radius: 50%;
				flex-shrink: 0;
				margin-inline-start: 4px;
			}

			.name {
				white-space: nowrap;
				margin-inline-start: 4px;
			}
		}

		.line-two {
			display: flex;
			align-items: center;
			font-size: 0.9em;
			color: var(--color-text-maxcontrast);
		}
	}
}
</style>

<!--
  - @copyright 2023 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @author 2023 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<NcModal @close="$emit('close', $event)">
		<div class="public-calendar-subscription-picker">
			<h2 v-if="showHolidays">
				{{ t('calendar', 'Public holiday calendars') }}
			</h2>
			<h2 v-else>
				{{ t('calendar', 'Public calendars') }}
			</h2>
			<NcEmptyContent v-if="!calendars.length"
				:title="$t('calendar', 'No valid public calendars configured')"
				:description="$t('calendar', 'Speak to the server administrator to resolve this issue.' )">
				<template #icon>
					<CalendarBlank :size="20" decorative />
				</template>
			</NcEmptyContent>
			<p v-else-if="showHolidays" class="holiday-subscription-picker__attribution">
				{{ t('calendar',
					'Public holiday calendars are provided by Thunderbird. Calendar data will be downloaded from {website}',
					{ website: 'thunderbird.net' }) }}
			</p>
			<p v-else class="holiday-subscription-picker__attribution">
				{{ t('calendar', 'These public calendars are suggested by the sever administrator. Calendar data will be downloaded from the respective website.') }}
			</p>
			<div v-for="calendar in calendars" :key="calendar.source" class="public-calendar-subscription-picker__region">
				<div class="public-calendar-subscription-picker__region__name">
					<h3>{{ calendar.name }}</h3>
					<div v-if="calendar.description" class="public-calendar-subscription-picker__region__name__subline">
						{{ calendar.description }}
					</div>
					<div v-if="calendar.authors" class="public-calendar-subscription-picker__region__name__subline">
						{{ t('calendar', 'By {authors}', { authors: calendar.authors }) }}
					</div>
				</div>
				<div class="public-calendar-subscription-picker__region__subcribe">
					<NcButton :disabled="loading || subscribing[calendar.source] || subscribed[calendar.source]"
						@click="subscribe(calendar)">
						{{ subscribed[calendar.source] ? t('calendar', 'Subscribed') : t('calendar', 'Subscribe') }}
					</NcButton>
				</div>
			</div>
		</div>
	</NcModal>
</template>

<script>
import { NcButton, NcEmptyContent, NcModal } from '@nextcloud/vue'
import { showError } from '@nextcloud/dialogs'
import { mapGetters } from 'vuex'
import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'

import { findAllSubscriptions } from '../../services/caldavService.js'
import holidayCalendars from '../../resources/holiday_calendars.json'
import { uidToHexColor } from '../../utils/color.js'
import { loadState } from '@nextcloud/initial-state'

const isValidString = (str, allowNull = false) => {
	return typeof str === 'string' || str instanceof String || (allowNull && !str)
}
const isValidURL = str => {
	try {
		return Boolean(new URL(str))
	} catch {
		return false
	}
}

export default {
	name: 'PublicCalendarSubscriptionPicker',
	components: {
		CalendarBlank,
		NcButton,
		NcEmptyContent,
		NcModal,
	},
	props: {
		showHolidays: Boolean,
	},
	data() {
		let calendars = []
		if (this.showHolidays) {
			calendars = holidayCalendars.map(calendar => ({
				...calendar,
				displayName: t('calendar', 'Holidays in {region}', {
					region: calendar.country,
				}),
				name: calendar.country,
				description: calendar.datespan,
				source: 'https://www.thunderbird.net/media/caldata/' + calendar.filename,
			}))
		} else {
			try {
				const state = loadState('calendar', 'publicCalendars')
				calendars = JSON.parse(state).filter(calendar => {
					const isValid = isValidString(calendar.name)
						&& isValidURL(calendar.source)
						&& isValidString(calendar.displayName, true)
						&& isValidString(calendar.description, true)
						&& isValidString(calendar.authors, true)
					if (!isValid) {
						console.error('Invalid public calendar', calendar)
					}
					return isValid
				})
			} catch (error) {
				console.error('Could not read public calendars', error)
				showError(this.$t('calendar', 'An error occurred, unable to read public calendars.'))
			}
		}
		const subscribing = {}
		const subscribed = {}
		calendars.forEach(calendar => {
			subscribing[calendar.source] = false
			subscribed[calendar.source] = false
		})
		return {
			calendars,
			loading: true,
			subscribed,
			subscribing,
			subscriptions: [],
		}
	},
	computed: {
		...mapGetters([
			'sortedCalendars',
		]),
	},
	async mounted() {
		this.subscriptions = await findAllSubscriptions()
		this.subscriptions.map(sub => (this.subscribed[sub.source] = true))
		this.loading = false
	},
	methods: {
		async subscribe(calendar) {
			try {
				this.subscribing[calendar.source] = true

				await this.$store.dispatch('appendSubscription', {
					displayName: calendar.displayName || calendar.name,
					color: uidToHexColor(calendar.source),
					source: calendar.source,
				})
				this.subscribed[calendar.source] = true
			} catch (error) {
				console.error('Could not add calendar subscription', error)
				showError(this.$t('calendar', 'An error occurred, unable to subscribe to calendar.'))
			} finally {
				this.subscribing[calendar.source] = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.public-calendar-subscription-picker {
	padding: 20px;

	&__attribution {
		color: var(--color-text-maxcontrast)
	}

	&__region {
		display: flex;
		margin-top: 20px;
		align-items: center;

		&__name {
			flex-grow: 1;

			h3 {
				font-weight: bold;
				margin-bottom: initial;
			}

			&__subline {
				color: var(--color-text-maxcontrast)
			}
		}

		&__subscribe {}
	}
}
</style>

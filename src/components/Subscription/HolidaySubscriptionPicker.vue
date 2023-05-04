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
		<div class="holiday-subscription-picker">
			<h2>{{ t('calendar', 'Holiday calendars') }}</h2>
			<p class="holiday-subscription-picker__attribution">
				{{ t('calendar', 'Holiday calendars are provided by Thunderbird. Calendar data will be downloaded from {website}', { website: 'thunderbird.net' }) }}
			</p>
			<div v-for="calendar in calendars" :key="calendar.source" class="holiday-subscription-picker__region">
				<div class="holiday-subscription-picker__region__name">
					<h3>{{ calendar.country }}</h3>
					<div class="holiday-subscription-picker__region__name__subline">
						{{ calendar.datespan }}
					</div>
					<div class="holiday-subscription-picker__region__name__subline">
						{{ t('calendar', 'By {authors}', { authors: calendar.authors }) }}
					</div>
				</div>
				<div class="holiday-subscription-picker__region__subcribe">
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
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'
import { showError } from '@nextcloud/dialogs'
import { mapGetters } from 'vuex'

import { findAllSubscriptions } from '../../services/caldavService.js'
import holidayCalendars from '../../resources/holiday_calendars.json'
import { uidToHexColor } from '../../utils/color.js'

export default {
	name: 'HolidaySubscriptionPicker',
	components: {
		NcButton,
		NcModal,
	},
	data() {
		const calendars = holidayCalendars.map(calendar => ({
			...calendar,
			source: 'https://www.thunderbird.net/media/caldata/' + calendar.filename,
		}))
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
					displayName: t('calendar', 'Holidays in {region}', {
					  region: calendar.country,
					}),
					color: uidToHexColor(calendar.source),
					source: calendar.source,
				})
				this.subscribed[calendar.source] = true
			} catch (error) {
				console.error('Could not add holiday subscription', error)
				showError(this.$t('calendar', 'An error occurred, unable to create the holiday calendar.'))
			} finally {
				this.subscribing[calendar.source] = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.holiday-subscription-picker {
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
		&__subscribe {

		}
	}
}
</style>

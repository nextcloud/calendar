<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<multiselect
		:options="matches"
		:searchable="true"
		:internal-search="false"
		:max-height="600"
		:show-no-results="true"
		:placeholder="placeholder"
		:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
		open-direction="bottom"
		track-by="email"
		label="dropdownName"
		@search-change="findAttendees"
		@input="addAttendee">
		<!--		<template slot="singleLabel" slot-scope="props"><img class="option__image" :src="props.option.img" alt="No Man’s Sky"><span class="option__desc"><span class="option__title">{{ props.option.title }}</span></span></template>-->
		<template slot="singleLabel" slot-scope="props">
			<Avatar :user="props.option.avatar" :display-name="props.option.dropdownName" />
			<span class="margin-left: 8px">{{ props.option.dropdownName }}</span>
		</template>
		<template slot="option" slot-scope="props">
			<Avatar :user="props.option.avatar" :display-name="props.option.dropdownName" />
			<span>{{ props.option.dropdownName }}</span>
		</template>
	</multiselect>
</template>

<script>
import {
	Avatar,
	Multiselect
} from 'nextcloud-vue'
import client from '../../../services/cdav'
import HttpClient from 'nextcloud-axios'
import debounce from 'debounce'
import { linkTo } from 'nextcloud-router'

export default {
	name: 'InviteesListSearch',
	components: {
		Avatar,
		Multiselect
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			matches: []
		}
	},
	computed: {
		placeholder() {
			return t('calendar', 'Search for e-mails, users, contacts, resources or rooms')
		},
		noResult() {
			return t('calendar', 'No match found')
		}
	},
	methods: {
		findAttendees: debounce(async function(query) {
			this.isLoading = true
			this.matches = []

			if (query.length > 0) {
				const promises = [
					this.findAttendeesFromContactsAPI(query),
					this.findAttendeesFromDAV(query),
				]

				const [contactsResults, davResults] = await Promise.all(promises)
				this.matches.push(...contactsResults)
				this.matches.push(...davResults)

				console.debug(contactsResults, davResults, this.matches)

				this.isLoading = false
				this.inputGiven = true
			} else {
				this.inputGiven = false
				this.isLoading = false
			}

		}, 500),
		addAttendee() {

		},
		async findAttendeesFromContactsAPI(query) {
			return HttpClient.post(linkTo('calendar', 'index.php') + '/v1/autocompletion/attendee', {
				search: query
			}).then(({ data }) => {
				return data.map((result) => {
					return {
						calendarUserType: 'INDIVIDUAL',
						commonName: result.name,
						email: result.email,
						isUser: false,
						avatar: null,
						dropdownName: result.name || result.email
					}
				})
			}).catch((e) => {
				console.debug('ERROR', e)
				return []
			})
		},
		async findAttendeesFromDAV(query) {
			return client.principalPropertySearchByDisplayname(query).then((results) => {
				return results.filter((principal) => {
					if (!principal.email) {
						return false
					}

					// We do not support GROUPS for now
					if (principal.calendarUserType === 'GROUP') {
						return false
					}

					return true
				}).map((principal) => {
					return {
						commonName: principal.displayname,
						calendarUserType: principal.calendarUserType,
						email: principal.email,
						lang: null,
						isUser: principal.calendarUserType === 'INDIVIDUAL',
						avatar: principal.userId,
						dropdownName: principal.displayname || principal.email
					}
				})
			}).catch((e) => {
				console.debug('ERROR', e)
				return []
			})
		}
	}
}
</script>

<style scoped>

</style>

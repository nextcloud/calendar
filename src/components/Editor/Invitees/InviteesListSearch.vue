<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<Multiselect class="invitees-search__multiselect"
		:options="matches"
		:searchable="true"
		:internal-search="false"
		:max-height="600"
		:show-no-results="true"
		:show-no-options="false"
		:placeholder="placeholder"
		:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
		open-direction="bottom"
		track-by="uid"
		label="dropdownName"
		@search-change="findAttendees"
		@select="addAttendee">
		<template #option="{ option }">
			<div class="invitees-search-list-item">
				<!-- We need to specify a unique key here for the avatar to be reactive. -->
				<Avatar v-if="option.isUser"
					:key="option.uid"
					:user="option.avatar"
					:display-name="option.dropdownName" />
				<Avatar v-else
					:key="option.uid"
					:url="option.avatar"
					:display-name="option.dropdownName" />

				<div class="invitees-search-list-item__label">
					<div>
						{{ option.dropdownName }}
					</div>
					<div v-if="option.email !== option.dropdownName">
						{{ option.email }}
					</div>
				</div>
			</div>
		</template>
	</Multiselect>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService.js'
import HttpClient from '@nextcloud/axios'
import debounce from 'debounce'
import { linkTo } from '@nextcloud/router'
import { randomId } from '../../../utils/randomId'

export default {
	name: 'InviteesListSearch',
	components: {
		Avatar,
		Multiselect,
	},
	props: {
		alreadyInvitedEmails: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			matches: [],
		}
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Search for emails, users or contacts')
		},
		noResult() {
			return this.$t('calendar', 'No match found')
		},
	},
	methods: {
		findAttendees: debounce(async function(query) {
			this.isLoading = true
			const matches = []

			if (query.length > 0) {
				const promises = [
					this.findAttendeesFromContactsAPI(query),
					this.findAttendeesFromDAV(query),
				]

				const [contactsResults, davResults] = await Promise.all(promises)
				matches.push(...contactsResults)
				matches.push(...davResults)

				// Source of the Regex: https://stackoverflow.com/a/46181
				// eslint-disable-next-line
				const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
				if (emailRegex.test(query)) {
					const alreadyInList = matches.find((attendee) => attendee.email.toLowerCase() === query.toLowerCase())
					if (!alreadyInList) {
						matches.unshift({
							calendarUserType: 'INDIVIDUAL',
							commonName: query,
							email: query,
							isUser: false,
							avatar: null,
							language: null,
							timezoneId: null,
							hasMultipleEMails: false,
							dropdownName: query,
						})
					}
				}

				// Generate a unique id for every result to make the avatar components reactive
				for (const match of matches) {
					match.uid = randomId()
				}

				this.isLoading = false
				this.inputGiven = true
			} else {
				this.inputGiven = false
				this.isLoading = false
			}

			this.matches = matches
		}, 500),
		addAttendee(selectedValue) {
			this.$emit('add-attendee', selectedValue)
		},
		async findAttendeesFromContactsAPI(query) {
			let response

			try {
				response = await HttpClient.post(linkTo('calendar', 'index.php') + '/v1/autocompletion/attendee', {
					search: query,
				})
			} catch (error) {
				console.debug(error)
				return []
			}

			const data = response.data
			return data.reduce((arr, result) => {
				const hasMultipleEMails = result.emails.length > 1

				result.emails.forEach((email) => {
					let name
					if (result.name && !hasMultipleEMails) {
						name = result.name
					} else if (result.name && hasMultipleEMails) {
						name = `${result.name} (${email})`
					} else {
						name = email
					}

					if (this.alreadyInvitedEmails.includes(email)) {
						return
					}

					arr.push({
						calendarUserType: 'INDIVIDUAL',
						commonName: result.name,
						email,
						isUser: false,
						avatar: result.photo,
						language: result.lang,
						timezoneId: result.tzid,
						hasMultipleEMails,
						dropdownName: name,
					})
				})

				return arr
			}, [])
		},
		async findAttendeesFromDAV(query) {
			let results
			try {
				results = await principalPropertySearchByDisplaynameOrEmail(query)
			} catch (error) {
				console.debug(error)
				return []
			}

			return results.filter((principal) => {
				if (!principal.email) {
					return false
				}

				if (this.alreadyInvitedEmails.includes(principal.email)) {
					return false
				}

				// We do not support GROUPS for now
				if (principal.calendarUserType === 'GROUP') {
					return false
				}

				// Do not include resources and rooms
				if (['ROOM', 'RESOURCE'].includes(principal.calendarUserType)) {
					return false
				}

				return true
			}).map((principal) => {
				return {
					commonName: principal.displayname,
					calendarUserType: principal.calendarUserType,
					email: principal.email,
					language: principal.language,
					isUser: principal.calendarUserType === 'INDIVIDUAL',
					avatar: principal.userId,
					hasMultipleEMails: false,
					dropdownName: principal.displayname || principal.email,
				}
			})
		},
	},
}
</script>

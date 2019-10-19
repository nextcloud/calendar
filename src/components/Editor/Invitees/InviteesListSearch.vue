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
		class="invitees-search"
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
		@select="addAttendee"
	>
		<!--		<template slot="singleLabel" slot-scope="props"><img class="option__image" :src="props.option.img" alt="No Man’s Sky"><span class="option__desc"><span class="option__title">{{ props.option.title }}</span></span></template>-->
		<template slot="singleLabel" slot-scope="props">
			<div class="invitees-search-list-item">
				<Avatar v-if="props.option.isUser" :user="props.option.avatar" :display-name="props.option.dropdownName" />
				<Avatar v-if="!props.option.isUser" :url="props.option.avatar" :display-name="props.option.dropdownName" />
				<div v-if="props.option.hasMultipleEMails" class="invitees-search-list-item__label invitees-search-list-item__label--with-displayname">
					<div>
						{{ props.option.commonName }}
					</div>
					<div>
						{{ props.option.email }}
					</div>
				</div>
				<div v-else class="invitees-search-list-item__label invitees-search-list-item__label--single-email">
					<div>
						{{ props.option.dropdownName }}
					</div>
				</div>
			</div>
		</template>
		<template slot="option" slot-scope="props">
			<div class="invitees-search-list-item">
				<Avatar v-if="props.option.isUser" :user="props.option.avatar" :display-name="props.option.dropdownName" />
				<Avatar v-if="!props.option.isUser" :url="props.option.avatar" :display-name="props.option.dropdownName" />
				<div v-if="props.option.hasMultipleEMails" class="invitees-search-list-item__label invitees-search-list-item__label--with-multiple-email">
					<div>
						{{ props.option.commonName }}
					</div>
					<div>
						{{ props.option.email }}
					</div>
				</div>
				<div v-else class="invitees-search-list-item__label invitees-search-list-item__label--single-email">
					<div>
						{{ props.option.dropdownName }}
					</div>
				</div>
			</div>
		</template>
	</multiselect>
</template>

<script>
import {
	Avatar,
	Multiselect
} from '@nextcloud/vue'
import client from '../../../services/caldavService.js'
import HttpClient from '@nextcloud/axios'
import debounce from 'debounce'
import { linkTo } from '@nextcloud/router'

export default {
	name: 'InviteesListSearch',
	components: {
		Avatar,
		Multiselect
	},
	props: {
		alreadyInvitedEmails: {
			type: Array,
			required: true
		}
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
			return this.$t('calendar', 'Search for e-mails, users, contacts, resources or rooms')
		},
		noResult() {
			return this.$t('calendar', 'No match found')
		}
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
					const alreadyInList = matches.find((attendee) => attendee.email === query)
					if (!alreadyInList) {
						matches.unshift({
							calendarUserType: 'INDIVIDUAL',
							commonName: null,
							email: query,
							isUser: false,
							avatar: null,
							language: null,
							timezoneId: null,
							hasMultipleEMails: false,
							dropdownName: query
						})
					}
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
			this.$emit('addAttendee', selectedValue)
		},
		async findAttendeesFromContactsAPI(query) {
			return HttpClient.post(linkTo('calendar', 'index.php') + '/v1/autocompletion/attendee', {
				search: query
			}).then(({ data }) => {
				return data.reduce((arr, result) => {
					let hasMultipleEMails = result.emails.length > 1

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
							email: email,
							isUser: false,
							avatar: result.photo,
							language: result.lang,
							timezoneId: result.tzid,
							hasMultipleEMails,
							dropdownName: name
						})
					})

					return arr
				}, [])
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

					if (this.alreadyInvitedEmails.includes(principal.email)) {
						return
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
						hasMultipleEMails: false,
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

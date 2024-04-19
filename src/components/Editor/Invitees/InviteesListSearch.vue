<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcSelect
		class="invitees-search__vselect"
		:options="matches"
		:searchable="true"
		:max-height="600"
		:placeholder="placeholder"
		:class="{ showContent: inputGiven, 'icon-loading': isLoading }"
		:clearable="false"
		:labelOutside="true"
		inputId="uid"
		label="dropdownName"
		@search="findAttendees"
		@option:selected="addAttendee">
		<template #option="option">
			<div class="invitees-search-list-item">
				<Avatar v-if="option.type === 'group'">
					<template #icon>
						<AccountMultiple :size="20" />
					</template>
				</Avatar><!-- We need to specify a unique key here for the avatar to be reactive. -->
				<Avatar v-else-if="option.isUser"
					:key="option.uid"
					:user="option.avatar"
					:displayName="option.dropdownName" />
				<Avatar v-else-if="option.type === 'circle'">
					<template #icon>
						<GoogleCirclesCommunitiesIcon :size="20" />
					</template>
				</Avatar>
				<Avatar
					v-if="!option.isUser && option.type !== 'circle' && option.type !== 'group'"
					:key="option.uid"
					:url="option.avatar"
					:displayName="option.commonName" />

				<div class="invitees-search-list-item__label">
					<div>
						{{ option.commonName }}
					</div>
					<div v-if="option.email !== option.dropdownName && option.type !== 'circle' && option.type !== 'group'">
						{{ option.email }}
					</div>
					<div v-if="option.type === 'circle' || option.type === 'group'">
						{{ option.subtitle }}
					</div>
				</div>
			</div>
		</template>
	</NcSelect>
</template>

<script>
import HttpClient from '@nextcloud/axios'
import { showInfo } from '@nextcloud/dialogs'
import { linkTo } from '@nextcloud/router'
import {
	NcAvatar as Avatar,
	NcSelect,
} from '@nextcloud/vue'
import debounce from 'debounce'
import GoogleCirclesCommunitiesIcon from 'vue-material-design-icons/GoogleCirclesCommunities.vue'
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import {
	circleGetMembers,
	circleSearchByName,
} from '../../../services/circleService.js'
import isCirclesEnabled from '../../../services/isCirclesEnabled.js'
import { removeMailtoPrefix } from '../../../utils/attendee.js'
import { randomId } from '../../../utils/randomId.js'

export default {
	name: 'InviteesListSearch',
	components: {
		Avatar,
		NcSelect,
		GoogleCirclesCommunitiesIcon,
		AccountMultiple,
	},

	props: {
		alreadyInvitedEmails: {
			type: Array,
			required: true,
		},

		organizer: {
			type: Object,
			required: false,
		},
	},

	data() {
		return {
			isLoading: false,
			inputGiven: false,
			matches: [],
			isCirclesEnabled,
		}
	},

	computed: {
		placeholder() {
			return this.$t('calendar', 'Search for emails, users, contacts, contact groups or teams')
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
				]
				if (isCirclesEnabled) {
					promises.push(this.findAttendeesFromCircles(query))
				}

				const results = await Promise.all(promises)
				const [contactsResults, circleResults] = results
				matches.push(...contactsResults)
				if (isCirclesEnabled) {
					matches.push(...circleResults)
				}

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
			if (selectedValue.type === 'circle') {
				showInfo(this.$t('calendar', 'Note that members of circles get invited but are not synced yet.'))
				this.resolveCircleMembers(selectedValue.id, selectedValue.email)
			} else if (selectedValue.type === 'group') {
				selectedValue.contacts.forEach((contact) => {
					this.$emit('add-attendee', contact)
				})
			} else {
				this.$emit('add-attendee', selectedValue)
			}
		},

		async resolveCircleMembers(circleId) {
			let results
			try {
				// Going to query custom backend to fetch Circle members since we're going to use
				// mail addresses of local circle members. The Circles API doesn't expose member
				// emails yet. Change approved by @miaulalala and @ChristophWurst.
				results = await circleGetMembers(circleId)
			} catch (error) {
				console.debug(error)
				return []
			}
			results.data.forEach((member) => {
				if (!this.organizer || member.email !== this.organizer.uri) {
					this.$emit('addAttendee', member)
				}
			})
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

			const contacts = []
			/** Groups are shown before contacts */
			for (const [groupName, groupContacts] of Object.entries(response.data.groups)) {
				const processedGroupContacts = this.buildEmailsFromContactData(groupContacts)
				if (processedGroupContacts.length > 0) {
					contacts.push({
						type: 'group',
						dropdownName: groupName,
						subtitle: this.$n('calendar', 'Contains %n contact', 'Contains %n contacts', processedGroupContacts.length),
						contacts: processedGroupContacts,
					})
				}
			}

			return contacts
		},
		buildEmailsFromContactData(contactsData) {
			return contactsData.reduce((arr, result) => {
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

					if (email && this.alreadyInvitedEmails.includes(removeMailtoPrefix(email))) {
						return
					}

					arr.push({
						type: 'contact',
						calendarUserType: 'INDIVIDUAL',
						commonName: result.name,
						email,
						isUser: false,
						avatar: result.photo,
						language: result.lang,
						timezoneId: result.tzid,
						hasMultipleEMails,
						dropdownName: name + ' ' + email,
					})
				})

				return arr
			}, [])
		},

		async findAttendeesFromCircles(query) {
			let results
			try {
				results = await circleSearchByName(query)
			} catch (error) {
				console.debug(error)
				return []
			}

			return results.map((circle) => {
				return {
					commonName: circle.displayname,
					calendarUserType: 'GROUP',
					email: 'circle+' + circle.id + '@' + circle.instance,
					isUser: false,
					dropdownName: circle.displayname,
					type: 'circle',
					id: circle.id,
					subtitle: this.$n('calendar', '%n member', '%n members', circle.population),
				}
			})
		},
	},
}
</script>

<style scoped>
:deep(.avatardiv) {
	overflow: visible !important;
}
</style>

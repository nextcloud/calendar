<template>
	<fieldset class="settings-fieldset">
		<ul class="settings-fieldset-interior">
			<li v-show="showProgressBar" class="settings-feieldset-interior-item">
				<import-progress-bar />
			</li>
			<import-screen v-if="showImportModal" key="settings-import-screen" :files="files"
				@cancel-import="cancelImport" @import-calendar="importCalendar"
			/>
			<import-upload-button v-show="showUploadButton" key="settings-import-upload" :supported-file-types="['text/calendar']"
				:is-disabled="loadingCalendars" @change="processFiles"
			/>
			<li key="settings-saving-birthday" class="settings-feieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingBirthdayCalendar}" class="icon-loading-small" />
				<input id="app-settings-birthday-calendar-checkbox" v-model="birthdayValue" :disabled="savingBirthdayCalendar || loadingCalendars"
					class="checkbox" type="checkbox"
				>
				<label for="app-settings-birthday-calendar-checkbox">{{ birthdayCalendarLabel }}</label>
			</li>
			<li key="settings-saving-popover" class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingPopover}" class="icon-loading-small" />
				<input id="app-settings-popover-checkbox" v-model="popoverValue" :disabled="savingPopover"
					class="checkbox" type="checkbox"
				>
				<label for="app-settings-popover-checkbox">
					{{ popoverLabel }}
				</label>
			</li>
			<li key="settings-saving-weekend" class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingWeekend}" class="icon-loading-small" />
				<input id="app-settings-weekends-checkbox" v-model="weekendValue" :disabled="savingWeekend"
					class="checkbox" type="checkbox"
				>
				<label for="app-settings-weekends-checkbox">
					{{ weekendLabel }}
				</label>
			</li>
			<li key="settings-saving-weekend-number" class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingWeekNumber}" class="icon-loading-small" />
				<input id="app-settings-week-number-checkbox" v-model="weekNumberValue" :disabled="savingWeekNumber"
					class="checkbox" type="checkbox"
				>
				<label for="app-settings-week-number-checkbox">
					{{ weekNumberLabel }}
				</label>
			</li>
			<li key="settings-saving-timezone" class="settings-fieldset-interior-item settings-fieldset-interior-item-timezone">
				<label class="settings-input" for="app-settings-timezone-select">{{ timezoneLabel }}</label>
				<timezone-select id="app-settings-timezone-select" :additional-timezones="additionalTimezones" :value="timezoneValue"
					@change="setTimezoneValue"
				/>
			</li>
			<li key="settings-saving-caldav-primary" class="settings-fieldset-interior-item settings-fieldset-interior-item-link">
				<label class="settings-input">{{ primaryCalDAVLabel }}</label>
				<button :title="copyLinkLabel" class="icon icon-clippy"
					@click="copyPrimaryCalDAV"
				/>
			</li>
			<li key="settings-saving-caldav-macos" class="settings-fieldset-interior-item settings-fieldset-interior-item-link">
				<label class="settings-label">{{ appleCalDAVLabel }}</label>
				<button :title="copyLinkLabel" class="icon icon-clippy"
					@click="copyAppleCalDAV"
				/>
			</li>
		</ul>
	</fieldset>
</template>

<script>
import ImportProgressBar from './ImportProgressBar'
import ImportScreen from './ImportScreen'
import ImportUploadButton from './ImportUploadButton'
import TimezoneSelect from '../Shared/TimezoneSelect'

import client from '../../services/caldavService.js'
import detectTimezone from '../../services/timezoneDetectionService'

export default {
	name: 'Settings',
	components: {
		ImportProgressBar,
		ImportScreen,
		ImportUploadButton,
		TimezoneSelect
	},
	props: {
		loadingCalendars: {
			type: Boolean,
			default: false
		}
	},
	data: function() {
		return {
			savingBirthdayCalendar: false,
			savingPopover: false,
			savingWeekend: false,
			savingWeekNumber: false,
		}
	},
	computed: {
		settingsLabel() {
			return t('calendar', 'Settings & import')
		},
		birthdayCalendarLabel() {
			return t('calendar', 'Enable birthday calendar')
		},
		birthdayValue: {
			get() {
				return this.$store.getters.hasBirthdayCalendar
			},
			set() {
				this.toggleBirthdayCalendarEnabled()
			}
		},
		popoverLabel() {
			return t('calendar', 'Enable simplified editor')
		},
		popoverValue: {
			get() {
				return this.$store.getters.getSettings.showPopover
			},
			set() {
				this.togglePopoverEnabled()
			}
		},
		weekendLabel() {
			return t('calendar', 'Show weekends')
		},
		weekendValue: {
			get() {
				return this.$store.getters.getSettings.showWeekends
			},
			set() {
				this.toggleWeekendsEnabled()
			}
		},
		weekNumberLabel() {
			return t('calendar', 'Show week numbers')
		},
		weekNumberValue: {
			get() {
				return this.$store.getters.getSettings.showWeekNumbers
			},
			set() {
				this.toggleWeekNumberEnabled()
			}
		},
		timezoneLabel() {
			return t('calendar', 'Timezone')
		},
		primaryCalDAVLabel() {
			return t('calendar', 'Primary CalDAV address')
		},
		appleCalDAVLabel() {
			return t('calendar', 'iOS/macOS CalDAV address')
		},
		copyLinkLabel() {
			return t('calendar', 'Copy link')
		},
		timezoneValue() {
			return this.$store.getters.getSettings.timezone || 'automatic'
		},
		additionalTimezones() {
			return [{
				continent: t('calendar', 'Automatic'),
				timezoneId: 'automatic',
				label: t('calendar', 'Automatic ({detected})', {
					detected: detectTimezone()
				})
			}]
		},
		files() {
			return this.$store.state.importFiles.importFiles
		},
		showUploadButton() {
			return this.$store.state.importState.importState.stage === 'default'
		},
		showImportModal() {
			return this.$store.state.importState.importState.stage === 'processing'
		},
		showProgressBar() {
			return this.$store.state.importState.importState.stage === 'importing'
		}
	},
	methods: {
		toggleBirthdayCalendarEnabled() {
			return null
		},
		toggleBirthdayEnabled() {
			// change to loading status
			this.savingBirthdayCalendar = true
			this.$store.dispatch('toggleBirthdayCalendarEnabled').then(() => {
				this.savingBirthdayCalendar = false
			}).catch((err) => {
				console.error(err)
				OC.Notification.showTemporary(t('calendar', 'Saving updated setting was not successful'))
				this.savingBirthdayCalendar = false
			})
		},
		togglePopoverEnabled() {
			// change to loading status
			this.savingPopover = true
			this.$store.dispatch('togglePopoverEnabled').then(() => {
				this.savingPopover = false
			}).catch((err) => {
				console.error(err)
				OC.Notification.showTemporary(t('calendar', 'Saving updated setting was not successful'))
				this.savingPopover = false
			})
		},
		toggleWeekendsEnabled() {
			// change to loading status
			this.savingWeekend = true
			this.$store.dispatch('toggleWeekendsEnabled').then(() => {
				this.savingWeekend = false
			}).catch((err) => {
				console.error(err)
				OC.Notification.showTemporary(t('calendar', 'Saving updated setting was not successful'))
				this.savingWeekend = false
			})
		},
		toggleWeekNumberEnabled() {
			// change to loading status
			this.savingWeekNumber = true
			this.$store.dispatch('toggleWeekNumberEnabled').then(() => {
				this.savingWeekNumber = false
			}).catch((err) => {
				console.error(err)
				OC.Notification.showTemporary(t('calendar', 'Saving updated setting was not successful'))
				this.savingWeekNumber = false
			})
		},
		copyPrimaryCalDAV() {
			this.$copyText(OC.linkToRemote('dav'))
		},
		copyAppleCalDAV() {
			const rootURL = OC.linkToRemote('dav')
			const url = new URL(client.currentUserPrincipal.principalUrl, rootURL)

			this.$copyText(url)
		},
		setTimezoneValue(timezoneId) {
			return this.$store.dispatch('setTimezone', { timezoneId }).then(() => {
			}).catch((err) => {
				console.error(err)
				OC.Notification.showTemporary(t('calendar', 'Saving timezone setting was not successful'))
			})
		},
		processFiles() {
			this.$store.commit('changeStage', 'processing')
		},
		importCalendar() {
			this.$store.dispatch('importEventsIntoCalendar').then(() => {
				const total = this.$store.state.importState.importState.total
				const accepted = this.$store.state.importState.importState.accepted

				if (total === accepted) {
					OCP.Toast.success(n('calendar', 'Successfully imported %n event', 'Successfully imported %n events.', total))
				} else {
					OCP.Toast.warning(t('calendar', 'Import partially failed. Imported {accepted} out of {total}.', {
						accepted, total
					}))
				}

				// Reset everything
				this.cancelImport()
			})
		},
		cancelImport() {
			this.$store.commit('removeAllFiles')
			this.$store.commit('resetState')
		}
	}
}
</script>

<style scoped>
.settings-fieldset-interior-item-checkbox {
	display: flex;
}

.icon-loading-small {
	margin-right: 3px;
}

.icon-loading-small:not(.hidden) + input + label:before {
	display: none;
}

.settings-fieldset-interior-item-link {
	display: flex;
	justify-content: space-between;
}

.settings-fieldset-interior-item-link label {
	padding: 5px 0;
}

.settings-fieldset-interior-item-link button {
	border: 0;
	background-color: transparent;
}
</style>

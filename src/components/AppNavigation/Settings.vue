<template>
	<fieldset class="settings-fieldset">
		<ul class="settings-fieldset-interior">
			<!--<li class="settings-fieldset-interior-item settings-fieldset-interior-upload">-->
			<!--<input type="file" name="file" accept="text/calendar" multiple id="import" />-->
			<!--<span href="#" class="button settings-upload svg icon-upload" role="button" id="import-button-overlay"><?php p($l->t('Import calendar')); ?></span>-->
			<!--<span ng-show="!files.length" class="hide"><?php p($l->t('No Calendars selected for import')); ?></span>-->
			<!--</li>-->
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingBirthdayCalendar}" class="icon-loading-small" />
				<input id="app-settings-birthday-calendar-checkbox" :disabled="savingBirthdayCalendar" class="checkbox"
					type="checkbox">
				<label for="app-settings-birthday-calendar-checkbox">{{ birthdayCalendarLabel }}</label>
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingPopover}" class="icon-loading-small" />
				<input id="app-settings-popover-checkbox" :disabled="savingPopover" v-model="popoverValue"
					class="checkbox" type="checkbox" @change="togglePopoverEnabled">
				<label for="app-settings-popover-checkbox">{{ popoverLabel }}</label>
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingWeekend}" class="icon-loading-small" />
				<input id="app-settings-weekends-checkbox" :disabled="savingWeekend" v-model="weekendValue"
					class="checkbox" type="checkbox" @change="toggleWeekendsEnabled">
				<label for="app-settings-weekends-checkbox">{{ weekendLabel }}</label>
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item-checkbox">
				<span :class="{hidden: !savingWeekNumber}" class="icon-loading-small" />
				<input id="app-settings-week-number-checkbox" :disabled="savingWeekNumber" v-model="weekNumberValue"
					class="checkbox" type="checkbox" @change="toggleWeekNumberEnabled">
				<label for="app-settings-week-number-checkbox">{{ weekNumberLabel }}</label>
			</li>
			<li class="settings-fieldset-interior-item">
				<label class="settings-input">{{ timezoneLabel }}</label>
				<!--<select ng-options="timezone.value as timezone.displayname | timezoneWithoutContinentFilter group by timezone.group for timezone in timezones"-->
				<!--ng-model="timezone" ng-change="setTimezone()" class="input settings-input"></select>-->
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item-link">
				<label class="settings-input">{{ primaryCalDAVLabel }}</label>
				<button :title="copyLinkLabel" class="icon icon-clippy"
					@click="copyPrimaryCalDAV" />
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item-link">
				<label class="settings-label">{{ appleCalDAVLabel }}</label>
				<button :title="copyLinkLabel" class="icon icon-clippy"
					@click="copyAppleCalDAV" />
			</li>
		</ul>
	</fieldset>
</template>

<script>
import client from '../../services/cdav'

export default {
	name: 'Settings',
	data: function() {
		return {
			savingBirthdayCalendar: false,
			savingPopover: false,
			savingWeekend: false,
			savingWeekNumber: false
		}
	},
	computed: {
		settingsLabel() {
			return t('calendar', 'Settings & import')
		},
		birthdayCalendarLabel() {
			return t('calendar', 'Enable birthday calendar')
		},
		popoverLabel() {
			return t('calendar', 'Enable simplified editor')
		},
		popoverValue: {
			get() {
				return this.$store.state.settings.showPopover
			},
			set(v) {}
		},
		weekendLabel() {
			return t('calendar', 'Show weekends')
		},
		weekendValue: {
			get() {
				return this.$store.state.settings.showWeekends
			},
			set(v) {}
		},
		weekNumberLabel() {
			return t('calendar', 'Show week numbers')
		},
		weekNumberValue: {
			get() {
				return this.$store.state.settings.showWeekNumbers
			},
			set(v) {}
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
		}
	},
	methods: {
		toggleBirthdayCalendarEnabled() {
			return null
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

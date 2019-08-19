<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<li v-click-outside="reset" :class="{confirmed: activated, active: armed}">
		<a class="confirmation-default" @click="activate($event)">
			<span class="icon-delete" />
			<span>{{ t('calendar', 'Delete') }}</span>
		</a>
		<a :title="t('calendar', 'Cancel')" class="confirmation-abort icon-close" @click="reset">
			<span />
		</a>
		<a v-tooltip="{
				placement: 'left',
				show: activated,
				trigger: 'manual',
				boundariesElement: 'body',
				content: message
			}"
			class="confirmation-confirm icon-delete-white no-permission" @click="deleteCalendar($event)"
		>
			<span class="countdown">{{ remaining }}</span>
		</a>
	</li>
</template>

<script>
import clickOutside from 'vue-click-outside'

export default {
	name: 'PopoverMenu',
	components: {
		clickOutside
	},
	directives: {
		clickOutside
	},
	props: {
		message: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			remaining: 3,
			activated: false,
			armed: false
		}
	},
	methods: {
		reset: function() {
			this.activated = false
			this.armed = false
			this.remaining = 3
		},
		activate: function(e) {
			this.activated = true
			this.countdown()
			e.stopPropagation()
		},
		countdown: function() {
			this.remaining--
			if (this.remaining > 0) {
				setTimeout(this.countdown, 1000)
			} else {
				this.armed = true
			}
		},
		deleteCalendar: function(e) {
			if (this.armed) {
				this.$emit('delete-calendar')
				this.activated = false
			} else {
				e.stopPropagation()
			}
		}
	}
}
</script>

<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="availability-indicator">
		<span
			class="availability-indicator__dot"
			:class="dotClass"
			aria-hidden="true" />
		<span>{{ label }}</span>
	</div>
</template>

<script>
export default {
	name: 'AvailabilityIndicator',
	props: {
		available: {
			type: Boolean,
			default: null,
		},
	},

	computed: {
		/**
		 * @return {string} The modifier class for the availability dot's color
		 */
		dotClass() {
			switch (this.available) {
				case true:
					return 'availability-indicator__dot--available'
				case false:
					return 'availability-indicator__dot--unavailable'
				default:
					return 'availability-indicator__dot--unknown'
			}
		},

		/**
		 * @return {string} The localized availability
		 */
		label() {
			switch (this.available) {
				case true:
					return this.$t('calendar', 'available')
				case false:
					return this.$t('calendar', 'unavailable')
				default:
					return this.$t('calendar', 'unknown')
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.availability-indicator {
	display: inline-flex;
	align-items: center;
	gap: 6px;

	&__dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;

		&--available {
			background-color: var(--color-success);
		}

		&--unavailable {
			background-color: var(--color-error);
		}

		&--unknown {
			background-color: var(--color-border-maxcontrast);
		}
	}
}
</style>

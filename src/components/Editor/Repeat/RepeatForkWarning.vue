<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-warning">
		<div class="repeat-option-warning__icon icon icon-info" />
		<strong class="repeat-option-warning__info">
			{{ $t('calendar', 'Changes to the recurrence-rule will only apply to this and all future occurrences.') }}
		</strong>
	</div>
</template>

<script>
export default {
	name: 'RepeatForkWarning',
}
</script>

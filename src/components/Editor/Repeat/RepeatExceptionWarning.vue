<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-warning">
		<strong>
			{{ $t('calendar', 'This event is the recurrence-exception of a recurrence-set. You cannot add a recurrence-rule to it.') }}
		</strong>
	</div>
</template>

<script>
export default {
	name: 'RepeatExceptionWarning',
}
</script>

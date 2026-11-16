<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { computed } from 'vue'
import useEventEditorExtensionInstancesStore from '@/store/eventEditorExtensionInstances'

const eventEditorExtensionInstancesStore = useEventEditorExtensionInstancesStore()
const fields = computed(() => eventEditorExtensionInstancesStore.fields)

/**
 * Move the field of an extension into its container.
 * Moving keeps the element and its state, e.g. when switching from the popover to the full editor.
 *
 * @param container - The container from the function ref, `null` when it is unmounted or the ref is replaced on re-render
 * @param element - The field of the extension
 */
function mountElement(container: Element | null, element: Element): void {
	if (container === null) {
		return
	}
	if (element.parentElement === container) {
		return
	}
	container.replaceChildren(element)
}
</script>

<template>
	<div
		v-for="field in fields"
		:key="field.id"
		:ref="(el: Element | null) => mountElement(el, field.element)"
		class="extension-custom-field" />
</template>

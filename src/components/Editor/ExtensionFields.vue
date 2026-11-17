<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { computed } from 'vue'
import useEventEditorExtensionInstancesStore from '@/store/eventEditorExtensionInstances'

defineProps<{
	/** Whether the editor shows the event read-only, styles the fields like the read-only built-in text properties */
	isReadOnly: boolean
}>()

const eventEditorExtensionInstancesStore = useEventEditorExtensionInstancesStore()
const fields = computed(() => eventEditorExtensionInstancesStore.fields)

/**
 * Move an element of an extension into its container.
 * Moving keeps the element and its state, e.g. when switching from the popover to the full editor.
 *
 * @param container - The container from the function ref, `null` when it is unmounted or the ref is replaced on re-render
 * @param element - The element of the extension, `undefined` for a field without icon
 */
function mountElement(container: Element | null, element: Element | undefined): void {
	if (container === null || element === undefined) {
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
		class="extension-field"
		:class="{ 'extension-field--readonly': isReadOnly }">
		<div :ref="(el: Element | null) => mountElement(el, field.icon)" class="extension-field__icon" />
		<div :ref="(el: Element | null) => mountElement(el, field.field)" class="extension-field__input" />
	</div>
</template>

<style lang="scss" scoped>
// Copied from the styles of `.property-text` in `src/components/Editor/Properties/PropertyText.vue`,
// so that the fields of extensions align with the icon and input of the built-in text properties, e.g. the location.
.extension-field {
	position: relative;
}

.extension-field__icon {
	position: absolute;
	top: calc(var(--default-grid-baseline) * 1);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
}

.extension-field__input {
	padding-inline-start: calc(var(--default-grid-baseline) * 9);
}

.edit-simple .extension-field__input {
	padding-inline-start: calc(var(--default-grid-baseline) * 12);
}

.extension-field--readonly .extension-field__input {
	padding-inline-start: calc(var(--default-grid-baseline) * 9);
}
</style>

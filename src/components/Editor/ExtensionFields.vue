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
 * Move an element of an extension into its container.
 * Moving keeps the element and its state, e.g. when switching from the popover to the full editor.
 *
 * @param container - The container from the function ref, `null` when it is unmounted or the ref is replaced on re-render
 * @param element - The element of the extension
 */
function mountElement(container: Element | null, element: HTMLElement): void {
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
		class="extension-field">
		<div :ref="(el: Element | null) => mountElement(el, field.icon)" class="extension-field__icon" />
		<div :ref="(el: Element | null) => mountElement(el, field.field)" class="extension-field__input" />
	</div>
</template>

<style lang="scss" scoped>
// Aligned with the icon and input of PropertyText
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
</style>

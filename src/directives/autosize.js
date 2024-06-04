/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import autosize from 'autosize'
import debounce from 'debounce'

let resizeObserver

if (window.ResizeObserver) {
	resizeObserver = new ResizeObserver(debounce(entries => {
		for (const entry of entries) {
			autosize.update(entry.target)
		}
	}), 20)
}

/**
 * Adds autosize to textarea on bind
 *
 * @param {Element} el The DOM element
 * @param {object} binding The binding's object
 * @param {VNode} vnode Virtual node
 */
const bind = (el, binding, vnode) => {
	// Check that the binding is true
	if (binding.value !== true) {
		return
	}

	// Verify this is actually a textarea
	if (el.tagName !== 'TEXTAREA') {
		return
	}

	vnode.context.$nextTick(() => {
		autosize(el)
	})

	if (resizeObserver) {
		resizeObserver.observe(el)
	}
}

/**
 * Updates the size of the textarea when updated
 *
 * @param {Element} el The DOM element
 * @param {object} binding The binding's object
 * @param {VNode} vnode Virtual node
 */
const update = (el, binding, vnode) => {
	if (binding.value === true && binding.oldValue === false) {
		bind(el, binding, vnode)
	}
	if (binding.value === false && binding.oldValue === true) {
		unbind(el)
	}
	if (binding.value === true && binding.oldValue === true) {
		autosize.update(el)
	}
}

/**
 * Removes autosize when textarea is removed
 *
 * @param {Element} el The DOM element
 */
const unbind = (el) => {
	autosize.destroy(el)
	if (resizeObserver) {
		resizeObserver.unobserve(el)
	}
}

export default {
	bind,
	update,
	unbind,
}

/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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

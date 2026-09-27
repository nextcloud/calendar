/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { PropType } from 'vue'

import { defineComponent, h, ref, watch } from 'vue'
import PropertySelect from '@/components/Editor/Properties/PropertySelect.vue'

export const Default = defineComponent({
	props: {
		value: {
			type: [String, null] as PropType<string | null>,
			default: null,
		},
		isReadOnly: {
			type: Boolean,
			default: false,
		},
		showIcon: {
			type: Boolean,
			default: true,
		},
		propModel: {
			type: Object,
			required: true,
		},
	},

	setup(props) {
		const currentValue = ref(props.value)
		watch(() => props.value, (v) => {
			currentValue.value = v
		})

		return () => h('div', [
			h(PropertySelect, {
				propModel: props.propModel,
				isReadOnly: props.isReadOnly,
				showIcon: props.showIcon,
				value: currentValue.value,
				'onUpdate:value': (newValue: string) => {
					currentValue.value = newValue
				},
			}),
			h('form', { hidden: true }, [
				h('input', {
					'data-testid': 'selected-value',
					readonly: true,
					value: currentValue.value,
				}),
			]),
		])
	},
})

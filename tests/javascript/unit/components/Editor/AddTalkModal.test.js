/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { showError, showSuccess } from '@nextcloud/dialogs'
import AddTalkModal from '@/components/Editor/AddTalkModal.vue'
import { generateRoomUrl } from '@/services/talkService'

vi.mock('@nextcloud/dialogs')
vi.mock('@nextcloud/initial-state', () => ({ loadState: (app, key, fallback) => fallback ?? {} }))
vi.mock('@/services/talkService')

describe('components/Editor/AddTalkModal test suite', () => {
	describe('selectConversation', () => {
		const url = 'https://cloud.example.com/call/abc123'

		/**
		 * @param {object} calendarObjectInstance stubbed instance from the store
		 */
		function buildVm(calendarObjectInstance) {
			const vm = {
				calendarObjectInstance,
				$emit: vi.fn(),
				$t: (app, text) => text,
			}
			vm.closeModal = AddTalkModal.methods.closeModal.bind(vm)
			return vm
		}

		beforeEach(() => {
			vi.clearAllMocks()
			generateRoomUrl.mockReturnValue(url)
		})

		it('emits updateLocation when the location is empty', async () => {
			const vm = buildVm({ location: '  ', description: 'Agenda' })

			await AddTalkModal.methods.selectConversation.call(vm, { token: 'abc123' })

			expect(vm.$emit).toHaveBeenCalledWith('updateLocation', url)
			expect(vm.$emit).not.toHaveBeenCalledWith('updateDescription', expect.anything())
			expect(vm.$emit).toHaveBeenCalledWith('close')
			expect(showSuccess).toHaveBeenCalledOnce()
			expect(showError).not.toHaveBeenCalled()
		})

		it('emits updateDescription with the link appended when the location is set', async () => {
			const vm = buildVm({ location: 'Room 1', description: 'Agenda' })

			await AddTalkModal.methods.selectConversation.call(vm, { token: 'abc123' })

			expect(vm.$emit).toHaveBeenCalledWith('updateDescription', 'Agenda\r\n\r\n' + url)
			expect(vm.$emit).not.toHaveBeenCalledWith('updateLocation', expect.anything())
			expect(vm.$emit).toHaveBeenCalledWith('close')
			expect(showSuccess).toHaveBeenCalledOnce()
			expect(showError).not.toHaveBeenCalled()
		})

		it('emits updateDescription with only the link when the description is empty', async () => {
			const vm = buildVm({ location: 'Room 1', description: null })

			await AddTalkModal.methods.selectConversation.call(vm, { token: 'abc123' })

			expect(vm.$emit).toHaveBeenCalledWith('updateDescription', url)
		})
	})
})

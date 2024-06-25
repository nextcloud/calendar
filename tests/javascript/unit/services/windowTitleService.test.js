/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import dateRangeFormat from '../../../../src/filters/dateRangeFormat.js'
import { getDateFromFirstdayParam } from '../../../../src/utils/date.js'
import windowTitleService from "../../../../src/services/windowTitleService.js";
import useSettingsStore from '../../../../src/store/settings.js'
import { createPinia, setActivePinia } from 'pinia'

jest.mock('../../../../src/filters/dateRangeFormat.js')
jest.mock('../../../../src/utils/date.js')

describe('services/windowTitleService', () => {

	beforeEach(() => {
		dateRangeFormat.mockClear()
		getDateFromFirstdayParam.mockClear()

		// Reset to previous one
		document.title = 'Standard Nextcloud title'

		setActivePinia(createPinia())
	})

	it('should update the title on route changes', () => {
		const settingsStore = useSettingsStore()
		settingsStore.momentLocale = 'momentLocaleLoadedFromState'

		const router = {
			beforeEach: jest.fn(),
		}

		const to = {
			params: {
				firstDay: 'first-day-param-of-to',
				view: 'view-param-of-to',
			}
		}
		const from = {
			params: {
				firstDay: 'first-day-param-of-from',
				view: 'view-param-of-from',
			}
		}
		const next = jest.fn()

		dateRangeFormat
			.mockReturnValueOnce('formatted date range')
		getDateFromFirstdayParam
			.mockReturnValueOnce('processed first-day-param')

		expect(document.title).toEqual('Standard Nextcloud title')

		windowTitleService(router)

		expect(document.title).toEqual('Standard Nextcloud title')

		router.beforeEach.mock.calls[0][0](to, from, next)

		expect(document.title).toEqual('formatted date range - Standard Nextcloud title')

		expect(dateRangeFormat).toHaveBeenCalledTimes(1)
		expect(dateRangeFormat).toHaveBeenNthCalledWith(1, 'processed first-day-param', 'view-param-of-to', 'momentLocaleLoadedFromState')

		expect(getDateFromFirstdayParam).toHaveBeenCalledTimes(1)
		expect(getDateFromFirstdayParam).toHaveBeenNthCalledWith(1, 'first-day-param-of-to')

		expect(next).toHaveBeenCalledTimes(1)
	})

	it('should not update the title if there is no firstDay in route', () => {
		const settingsStore = useSettingsStore()
		settingsStore.momentLocale = 'momentLocaleLoadedFromState'

		const router = {
			beforeEach: jest.fn(),
		}

		const to = {
			params: {
				view: 'view-param-of-to',
			}
		}
		const from = {
			params: {
				view: 'view-param-of-from',
			}
		}
		const next = jest.fn()

		dateRangeFormat
			.mockReturnValueOnce('formatted date range')
		getDateFromFirstdayParam
			.mockReturnValueOnce('processed first-day-param')

		expect(document.title).toEqual('Standard Nextcloud title')

		windowTitleService(router)

		expect(document.title).toEqual('Standard Nextcloud title')

		router.beforeEach.mock.calls[0][0](to, from, next)

		expect(document.title).toEqual('Standard Nextcloud title')

		expect(dateRangeFormat).toHaveBeenCalledTimes(0)
		expect(getDateFromFirstdayParam).toHaveBeenCalledTimes(0)

		expect(next).toHaveBeenCalledTimes(1)
	})

	it('should update the title on update of locale', () => {
		const settingsStore = useSettingsStore()

		const router = {
			beforeEach: jest.fn(),
			currentRoute: {
				params: {
					firstDay: 'first-day-param-of-current-route',
					view: 'view-param-of-current-route',
				}
			}
		}

		dateRangeFormat
			.mockReturnValueOnce('formatted date range')
		getDateFromFirstdayParam
			.mockReturnValueOnce('processed first-day-param')

		expect(document.title).toEqual('Standard Nextcloud title')

		windowTitleService(router)

		expect(document.title).toEqual('Standard Nextcloud title')

		settingsStore.setMomentLocale({ locale: 'momentLocaleFromPayload' })

		expect(document.title).toEqual('formatted date range - Standard Nextcloud title')

		expect(dateRangeFormat).toHaveBeenCalledTimes(1)
		expect(dateRangeFormat).toHaveBeenNthCalledWith(1, 'processed first-day-param', 'view-param-of-current-route', 'momentLocaleFromPayload')

		expect(getDateFromFirstdayParam).toHaveBeenCalledTimes(1)
		expect(getDateFromFirstdayParam).toHaveBeenNthCalledWith(1, 'first-day-param-of-current-route')

	})

})

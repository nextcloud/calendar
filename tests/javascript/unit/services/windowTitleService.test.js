/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import dateRangeFormat from '../../../../src/filters/dateRangeFormat.js'
import { getDateFromFirstdayParam } from '../../../../src/utils/date.js'
import windowTitleService from "../../../../src/services/windowTitleService.js";
jest.mock('../../../../src/filters/dateRangeFormat.js')
jest.mock('../../../../src/utils/date.js')

describe('services/windowTitleService', () => {

	beforeEach(() => {
		dateRangeFormat.mockClear()
		getDateFromFirstdayParam.mockClear()

		// Reset to previous one
		document.title = 'Standard Nextcloud title'
	})

	it('should update the title on route changes', () => {
		const router = {
			beforeEach: jest.fn(),
		}
		const store = {
			subscribe: jest.fn(),
			state: {
				settings: {
					momentLocale: 'momentLocaleLoadedFromState',
				},
			},
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

		windowTitleService(router, store)

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
		const router = {
			beforeEach: jest.fn(),
		}
		const store = {
			subscribe: jest.fn(),
			state: {
				settings: {
					momentLocale: 'momentLocaleLoadedFromState',
				},
			},
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

		windowTitleService(router, store)

		expect(document.title).toEqual('Standard Nextcloud title')

		router.beforeEach.mock.calls[0][0](to, from, next)

		expect(document.title).toEqual('Standard Nextcloud title')

		expect(dateRangeFormat).toHaveBeenCalledTimes(0)
		expect(getDateFromFirstdayParam).toHaveBeenCalledTimes(0)

		expect(next).toHaveBeenCalledTimes(1)
	})

	it('should update the title on update of locale', () => {
		const router = {
			beforeEach: jest.fn(),
			currentRoute: {
				params: {
					firstDay: 'first-day-param-of-current-route',
					view: 'view-param-of-current-route',
				}
			}
		}
		const store = {
			subscribe: jest.fn(),
		}

		dateRangeFormat
			.mockReturnValueOnce('formatted date range')
		getDateFromFirstdayParam
			.mockReturnValueOnce('processed first-day-param')

		expect(document.title).toEqual('Standard Nextcloud title')

		windowTitleService(router, store)

		expect(document.title).toEqual('Standard Nextcloud title')

		store.subscribe.mock.calls[0][0]({
			type: 'some_other_mutation',
		})

		expect(document.title).toEqual('Standard Nextcloud title')

		store.subscribe.mock.calls[0][0]({
			type: 'setMomentLocale',
			payload: 'momentLocaleFromPayload'
		})

		expect(document.title).toEqual('formatted date range - Standard Nextcloud title')

		expect(dateRangeFormat).toHaveBeenCalledTimes(1)
		expect(dateRangeFormat).toHaveBeenNthCalledWith(1, 'processed first-day-param', 'view-param-of-current-route', 'momentLocaleFromPayload')

		expect(getDateFromFirstdayParam).toHaveBeenCalledTimes(1)
		expect(getDateFromFirstdayParam).toHaveBeenNthCalledWith(1, 'first-day-param-of-current-route')

	})

})

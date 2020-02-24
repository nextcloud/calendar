/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
import { getWeekendDaysForLocale } from '../../../../src/fullcalendar/localeWeekendProvider.js'
import { getLocale } from '@nextcloud/l10n'
import dayRender from '../../../../src/fullcalendar/dayRender.js'
jest.mock('../../../../src/fullcalendar/localeWeekendProvider.js')
jest.mock('@nextcloud/l10n')

describe('fullcalendar/dayRender test suite', () => {

	beforeEach(() => {
		getWeekendDaysForLocale.mockClear()
		getLocale.mockClear()
	})

	it('should provide the correct weekend days for the us', () => {
		getLocale.mockReturnValue('en_US')
		getWeekendDaysForLocale.mockReturnValue(['sat', 'sun'])

		const elementMon = document.createElement('td');
		elementMon.classList.add('fc-day', 'fc-past', 'fc-mon')
		const elementTue = document.createElement('td');
		elementTue.classList.add('fc-day', 'fc-past', 'fc-tue')
		const elementWed = document.createElement('td');
		elementWed.classList.add('fc-day', 'fc-past', 'fc-wed')
		const elementThu = document.createElement('td');
		elementThu.classList.add('fc-day', 'fc-past', 'fc-thu')
		const elementFri = document.createElement('td');
		elementFri.classList.add('fc-day', 'fc-past', 'fc-fri')
		const elementSat = document.createElement('td');
		elementSat.classList.add('fc-day', 'fc-past', 'fc-sat')
		const elementSun = document.createElement('td');
		elementSun.classList.add('fc-day', 'fc-past', 'fc-sun')

		dayRender({ el: elementMon })
		dayRender({ el: elementTue })
		dayRender({ el: elementWed })
		dayRender({ el: elementThu })
		dayRender({ el: elementFri })
		dayRender({ el: elementSat })
		dayRender({ el: elementSun })

		expect(elementMon.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementMon.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementTue.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementTue.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementWed.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementWed.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementThu.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementThu.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementFri.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementFri.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementSat.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(false)
		expect(elementSat.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(true)

		expect(elementSun.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(false)
		expect(elementSun.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(true)

		expect(getLocale).toHaveBeenCalledTimes(7)
		expect(getWeekendDaysForLocale).toHaveBeenCalledTimes(7)
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(1, 'en_US')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(2, 'en_US')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(3, 'en_US')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(4, 'en_US')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(5, 'en_US')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(6, 'en_US')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(7, 'en_US')
	})

	it('should provide the correct weekend days for hebrew locale', () => {
		getLocale.mockReturnValue('he')
		getWeekendDaysForLocale.mockReturnValue(['fri', 'sat'])

		const elementMon = document.createElement('td');
		elementMon.classList.add('fc-day', 'fc-past', 'fc-mon')
		const elementTue = document.createElement('td');
		elementTue.classList.add('fc-day', 'fc-past', 'fc-tue')
		const elementWed = document.createElement('td');
		elementWed.classList.add('fc-day', 'fc-past', 'fc-wed')
		const elementThu = document.createElement('td');
		elementThu.classList.add('fc-day', 'fc-past', 'fc-thu')
		const elementFri = document.createElement('td');
		elementFri.classList.add('fc-day', 'fc-past', 'fc-fri')
		const elementSat = document.createElement('td');
		elementSat.classList.add('fc-day', 'fc-past', 'fc-sat')
		const elementSun = document.createElement('td');
		elementSun.classList.add('fc-day', 'fc-past', 'fc-sun')

		dayRender({ el: elementMon })
		dayRender({ el: elementTue })
		dayRender({ el: elementWed })
		dayRender({ el: elementThu })
		dayRender({ el: elementFri })
		dayRender({ el: elementSat })
		dayRender({ el: elementSun })

		expect(elementMon.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementMon.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementTue.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementTue.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementWed.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementWed.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementThu.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementThu.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(elementFri.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(false)
		expect(elementFri.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(true)

		expect(elementSat.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(false)
		expect(elementSat.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(true)

		expect(elementSun.classList.contains('nc-calendar-fc-day-of-workweek')).toEqual(true)
		expect(elementSun.classList.contains('nc-calendar-fc-day-of-weekend')).toEqual(false)

		expect(getLocale).toHaveBeenCalledTimes(7)
		expect(getWeekendDaysForLocale).toHaveBeenCalledTimes(7)
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(1, 'he')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(2, 'he')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(3, 'he')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(4, 'he')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(5, 'he')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(6, 'he')
		expect(getWeekendDaysForLocale).toHaveBeenNthCalledWith(7, 'he')
	})
})

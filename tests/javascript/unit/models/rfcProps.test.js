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
import rfcProps from '../../../../src/models/rfcProps.js'

jest.mock('@nextcloud/l10n')

describe('models/rfcProps test suite', () => {

	it('should provide property info for access class', () => {
		expect(rfcProps.accessClass).toEqual(expect.any(Object))

		expect(rfcProps.accessClass.readableName).toEqual('TRANSLATED:When shared show')
		expect(rfcProps.accessClass.icon).toEqual('icon-eye')
		expect(rfcProps.accessClass.multiple).toEqual(false)
		expect(rfcProps.accessClass.info).toEqual('TRANSLATED:The visibility of this event in shared calendars.')
		expect(rfcProps.accessClass.defaultValue).toEqual('PUBLIC')
	})

	it('should provide property info for location', () => {
		expect(rfcProps.location).toEqual(expect.any(Object))

		expect(rfcProps.location.readableName).toEqual('TRANSLATED:Location')
		expect(rfcProps.location.placeholder).toEqual('TRANSLATED:Add a location')
		expect(rfcProps.location.icon).toEqual('icon-address')
	})

	it('should provide property info for description', () => {
		expect(rfcProps.description).toEqual(expect.any(Object))

		expect(rfcProps.description.readableName).toEqual('TRANSLATED:Description')
		expect(rfcProps.description.placeholder).toEqual('TRANSLATED:Add a description')
		expect(rfcProps.description.icon).toEqual('icon-menu')
	})

	it('should provide property info for status', () => {
		expect(rfcProps.status).toEqual(expect.any(Object))

		expect(rfcProps.status.readableName).toEqual('TRANSLATED:Status')
		expect(rfcProps.status.icon).toEqual('icon-checkmark')
		expect(rfcProps.status.multiple).toEqual(false)
		expect(rfcProps.status.info).toEqual('TRANSLATED:Confirmation about the overall status of the event.')
		expect(rfcProps.status.defaultValue).toEqual('CONFIRMED')
	})

	it('should provide property info for timeTransparency', () => {
		expect(rfcProps.timeTransparency).toEqual(expect.any(Object))

		expect(rfcProps.timeTransparency.readableName).toEqual('TRANSLATED:Show as')
		expect(rfcProps.timeTransparency.icon).toEqual('icon-briefcase')
		expect(rfcProps.timeTransparency.multiple).toEqual(false)
		expect(rfcProps.timeTransparency.info).toEqual('TRANSLATED:Take this event into account when calculating free-busy information.')
		expect(rfcProps.timeTransparency.defaultValue).toEqual('TRANSPARENT')
	})

	it('should provide property info for categories', () => {
		expect(rfcProps.categories).toEqual(expect.any(Object))

		expect(rfcProps.categories.readableName).toEqual('TRANSLATED:Categories')
		expect(rfcProps.categories.icon).toEqual('icon-tag')
		expect(rfcProps.categories.multiple).toEqual(true)
		expect(rfcProps.categories.info).toEqual('TRANSLATED:Categories help you to structure and organize your events.')
		expect(rfcProps.categories.placeholder).toEqual('TRANSLATED:Search or add categories')
		expect(rfcProps.categories.tagPlaceholder).toEqual('TRANSLATED:Add this as a new category')
	})

	it('should provide property info for color', () => {
		expect(rfcProps.color).toEqual(expect.any(Object))

		expect(rfcProps.color.readableName).toEqual('TRANSLATED:Custom color')
		expect(rfcProps.color.multiple).toEqual(false)
		expect(rfcProps.color.icon).toEqual('icon-color-picker')
		expect(rfcProps.color.info).toEqual('TRANSLATED:Special color of this event. Overrides the calendar-color.')
	})

})

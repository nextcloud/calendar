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

import dateRangeFormat from "../../../../src/filters/dateRangeFormat.js";
import { translate } from '@nextcloud/l10n'

jest.mock('@nextcloud/l10n')

describe('format/dateRangeFormat test suite', () => {

	beforeEach(() => {
		translate.mockClear()

		translate
			.mockImplementation((app, str) => str)
	})

	it('should provide a format for day view', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		expect(dateRangeFormat(date, 'timeGridDay', 'de')).toMatchSnapshot()
	})

	it('should provide a format for week view', () => {

		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		expect(dateRangeFormat(date, 'timeGridWeek', 'de')).toMatchSnapshot()
	})

	it('should provide a format for month view', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		expect(dateRangeFormat(date, 'dayGridMonth', 'de')).toMatchSnapshot()
	})

	it('should provide month as fallback for unknown view', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		expect(dateRangeFormat(date, 'fooBarUnknownView', 'de')).toMatchSnapshot()
	})

})

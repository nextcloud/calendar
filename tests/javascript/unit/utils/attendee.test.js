/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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

import {
	addMailtoPrefix,
	organizerDisplayName,
	removeMailtoPrefix,
} from '../../../../src/utils/attendee'

describe('utils/attendee test suite', () => {
	it('should remove mailto prefixes from uris', () => {
		const uri = 'principal@test.com'
		expect(removeMailtoPrefix(uri)).toEqual(uri)
		expect(removeMailtoPrefix(`mailto:${uri}`)).toEqual(uri)
	})

	it('should return blank strings when uris are not of type string', () => {
		expect(removeMailtoPrefix(null)).toEqual('')
		expect(removeMailtoPrefix(undefined)).toEqual('')
	})

	it('should add mailto prefixes to uris', () => {
		const uri = 'principal@test.com'
		const uriWithPrefix = `mailto:${uri}`
		expect(addMailtoPrefix(uri)).toEqual(uriWithPrefix)
		expect(addMailtoPrefix(uriWithPrefix)).toEqual(uriWithPrefix)
	})
	
	it('should add mailto prefixes to uris when they are not of type string', () => {
		expect(addMailtoPrefix(null)).toEqual("mailto:")
		expect(addMailtoPrefix(undefined)).toEqual("mailto:")
	})

	it('should extract a display name of an organizer', () => {
		const commonName = 'My Name'
		const uri = 'uri@test.com'
		expect(organizerDisplayName(null)).toEqual('')
		expect(organizerDisplayName(undefined)).toEqual('')
		expect(organizerDisplayName({ commonName })).toEqual(commonName)
		expect(organizerDisplayName({ uri })).toEqual(uri)
		expect(organizerDisplayName({ uri: `mailto:${uri}` })).toEqual(uri)
		expect(organizerDisplayName({
			commonName,
			uri,
		})).toEqual(commonName)
	})
})

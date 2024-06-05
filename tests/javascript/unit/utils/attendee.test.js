/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

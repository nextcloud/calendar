/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
	addMailtoPrefix,
	looksLikeMailingList,
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

	describe('looksLikeMailingList', () => {
		it('detects exact local-part matches', () => {
			expect(looksLikeMailingList('announce@example.com')).toBe(true)
			expect(looksLikeMailingList('mailman@example.org')).toBe(true)
			expect(looksLikeMailingList('noreply@example.com')).toBe(true)
			expect(looksLikeMailingList('lists@example.com')).toBe(true)
		})

		it('detects local-part suffix matches', () => {
			expect(looksLikeMailingList('dev-bounces@example.org')).toBe(true)
			expect(looksLikeMailingList('project-request@example.com')).toBe(true)
			expect(looksLikeMailingList('calendar-users@example.com')).toBe(true)
			expect(looksLikeMailingList('app+bounces@example.com')).toBe(true)
		})

		it('detects known mailing list domains', () => {
			expect(looksLikeMailingList('group@googlegroups.com')).toBe(true)
			expect(looksLikeMailingList('list@groups.io')).toBe(true)
			expect(looksLikeMailingList('user@freelists.org')).toBe(true)
		})

		it('detects known mailing list subdomains', () => {
			expect(looksLikeMailingList('user@lists.nextcloud.com')).toBe(true)
			expect(looksLikeMailingList('someone@mailman.apache.org')).toBe(true)
			expect(looksLikeMailingList('foo@sympa.example.com')).toBe(true)
		})

		it('handles mailto: prefix', () => {
			expect(looksLikeMailingList('mailto:announce@example.com')).toBe(true)
			expect(looksLikeMailingList('mailto:john@example.com')).toBe(false)
		})

		it('returns false for regular email addresses', () => {
			expect(looksLikeMailingList('john@example.com')).toBe(false)
			expect(looksLikeMailingList('dev@example.com')).toBe(false)
			expect(looksLikeMailingList('alice@company.com')).toBe(false)
		})

		it('returns false for invalid input', () => {
			expect(looksLikeMailingList('notanemail')).toBe(false)
			expect(looksLikeMailingList(null)).toBe(false)
			expect(looksLikeMailingList(undefined)).toBe(false)
		})
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

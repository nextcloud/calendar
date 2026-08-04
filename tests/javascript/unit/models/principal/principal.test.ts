/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mapDavToRoomPrincipalProperties } from '@/models/principal/principal'
import logger from '@/utils/logger'
vi.mock('@/utils/logger')

describe('Test suite: Principal model (models/principal/principal.ts)', () => {
	beforeEach(() => {
		logger.warn.mockClear()
	})

	describe('mapDavToRoomPrincipalProperties', () => {
		describe('roomType', () => {
			it.for([
				['meeting-room', 'meeting-room'],
				[undefined, null],
			])('should accept %s', ([input, expected]) => {
				const properties = mapDavToRoomPrincipalProperties({ roomType: input })

				expect(properties).toMatchObject({ roomType: expected })
				expect(logger.warn).toHaveBeenCalledTimes(0)
			})

			it.for([
				[null, 'Could not extract `roomType`.'],
				[true, 'Could not extract `roomType`.'],
			])('should reject %s', ([input, warning]) => {
				const properties = mapDavToRoomPrincipalProperties({ roomType: input })

				expect(properties).toMatchObject({ roomType: null })
				expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomType: input } })
			})
		})

		describe('roomSeatingCapacity', () => {
			it.for([
				[12, 12],
				['12', 12],
				[undefined, null],
			])('should accept %s', ([input, expected]) => {
				const properties = mapDavToRoomPrincipalProperties({ roomSeatingCapacity: input })

				expect(properties).toMatchObject({ roomSeatingCapacity: expected })
				expect(logger.warn).toHaveBeenCalledTimes(0)
			})

			it.for([
				[null, 'Could not extract `roomSeatingCapacity`.'],
				[0, '`roomSeatingCapacity` is not a positive integer.'],
				[-5, '`roomSeatingCapacity` is not a positive integer.'],
				[12.5, '`roomSeatingCapacity` is not a positive integer.'],
				[true, 'Could not extract `roomSeatingCapacity`.'],
				['33p', 'Could not parse `roomSeatingCapacity` as a positive integer.'],
				['-33', 'Could not parse `roomSeatingCapacity` as a positive integer.'],
			])('should reject %s', ([input, warning]) => {
				const properties = mapDavToRoomPrincipalProperties({ roomSeatingCapacity: input })

				expect(properties).toMatchObject({ roomSeatingCapacity: null })
				expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomSeatingCapacity: input } })
			})
		})
	})

	describe('roomBuildingAddress', () => {
		it.for([
			['anAdreess', 'anAdreess'],
			[undefined, null],
		])('should accept %s', ([input, expected]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomBuildingAddress: input })

			expect(properties).toMatchObject({ roomBuildingAddress: expected })
			expect(logger.warn).toHaveBeenCalledTimes(0)
		})

		it.for([
			[null, 'Could not extract `roomBuildingAddress`.'],
			[true, 'Could not extract `roomBuildingAddress`.'],
		])('should reject %s', ([input, warning]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomBuildingAddress: input })

			expect(properties).toMatchObject({ roomBuildingAddress: null })
			expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomBuildingAddress: input } })
		})
	})

	describe('roomBroomBuildingStoryuildingAddress', () => {
		it.for([
			['aFloor', 'aFloor'],
			[undefined, null],
		])('should accept %s', ([input, expected]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomBuildingStory: input })

			expect(properties).toMatchObject({ roomBuildingStory: expected })
			expect(logger.warn).toHaveBeenCalledTimes(0)
		})

		it.for([
			[null, 'Could not extract `roomBuildingStory`.'],
			[true, 'Could not extract `roomBuildingStory`.'],
		])('should reject %s', ([input, warning]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomBuildingStory: input })

			expect(properties).toMatchObject({ roomBuildingStory: null })
			expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomBuildingStory: input } })
		})
	})

	describe('roomBuildingRoomNumber', () => {
		it.for([
			['aRoomNumber', 'aRoomNumber'],
			[undefined, null],
		])('should accept %s', ([input, expected]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomBuildingRoomNumber: input })

			expect(properties).toMatchObject({ roomBuildingRoomNumber: expected })
			expect(logger.warn).toHaveBeenCalledTimes(0)
		})

		it.for([
			[null, 'Could not extract `roomBuildingRoomNumber`.'],
			[true, 'Could not extract `roomBuildingRoomNumber`.'],
		])('should reject %s', ([input, warning]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomBuildingRoomNumber: input })

			expect(properties).toMatchObject({ roomBuildingRoomNumber: null })
			expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomBuildingRoomNumber: input } })
		})
	})

	describe('roomFeatures', () => {
		it.for([
			['feature1, feature 2', ['feature1', 'feature 2']],
			['feature1,', ['feature1']],
			['', []],
			[undefined, null],
		])('should accept %s', ([input, expected]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomFeatures: input })

			expect(properties).toMatchObject({ roomFeatures: expected })
			expect(logger.warn).toHaveBeenCalledTimes(0)
		})

		it.for([
			[null, 'Could not extract `roomFeatures`.'],
			[[], 'Could not extract `roomFeatures`.'],
			[true, 'Could not extract `roomFeatures`.'],
		])('should reject %s', ([input, warning]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomFeatures: input })

			expect(properties).toMatchObject({ roomFeatures: null })
			expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomFeatures: input } })
		})
	})

	describe('roomAddress', () => {
		it.for([
			['anAdreess', 'anAdreess'],
			[undefined, null],
		])('should accept %s', ([input, expected]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomAddress: input })

			expect(properties).toMatchObject({ roomAddress: expected })
			expect(logger.warn).toHaveBeenCalledTimes(0)
		})

		it.for([
			[null, 'Could not extract `roomAddress`.'],
			[true, 'Could not extract `roomAddress`.'],
		])('should reject %s', ([input, warning]) => {
			const properties = mapDavToRoomPrincipalProperties({ roomAddress: input })

			expect(properties).toMatchObject({ roomAddress: null })
			expect(logger.warn).toHaveBeenCalledExactlyOnceWith(warning, { dav: { roomAddress: input } })
		})
	})
})

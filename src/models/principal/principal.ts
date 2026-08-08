/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomPrincipalProperties } from '@/types/models/principal'

import logger from '@/utils/logger'

// NOTE File can be merged with @/models/principal.js after it was migrated to TypeScript.

/**
 * Extract properties specific to a room from a dav principal.
 *
 * @param dav cdav-library Principal object
 * @see {@link https://github.com/nextcloud/cdav-library/blob/main/src/models/principal.js} for the available properties on {@link dav}
 */
function mapDavToRoomPrincipalProperties(dav: Record<string, unknown>): RoomPrincipalProperties {
	const properties: RoomPrincipalProperties = {
		roomType: null,
		roomSeatingCapacity: null,
		roomBuildingAddress: null,
		roomBuildingStory: null,
		roomBuildingRoomNumber: null,
		roomFeatures: null,
		roomAddress: null,
	}

	if (typeof dav.roomType === 'string') {
		properties.roomType = dav.roomType
	} else if (dav.roomType !== undefined) {
		logger.warn('Could not extract `roomType`.', { dav })
	}

	if (typeof dav.roomSeatingCapacity === 'number') {
		if (Number.isInteger(dav.roomSeatingCapacity) && dav.roomSeatingCapacity > 0) {
			properties.roomSeatingCapacity = dav.roomSeatingCapacity
		} else {
			logger.warn('`roomSeatingCapacity` is not a positive integer.', { dav })
		}
	} else if (typeof dav.roomSeatingCapacity === 'string') {
		const parsed = Number(dav.roomSeatingCapacity)
		if (Number.isInteger(parsed) && parsed > 0) {
			properties.roomSeatingCapacity = parsed
		} else {
			logger.warn('Could not parse `roomSeatingCapacity` as a positive integer.', { dav })
		}
	} else if (dav.roomSeatingCapacity !== undefined) {
		logger.warn('Could not extract `roomSeatingCapacity`.', { dav })
	}

	if (typeof dav.roomBuildingAddress === 'string') {
		properties.roomBuildingAddress = dav.roomBuildingAddress
	} else if (dav.roomBuildingAddress !== undefined) {
		logger.warn('Could not extract `roomBuildingAddress`.', { dav })
	}

	if (typeof dav.roomBuildingStory === 'string') {
		properties.roomBuildingStory = dav.roomBuildingStory
	} else if (dav.roomBuildingStory !== undefined) {
		logger.warn('Could not extract `roomBuildingStory`.', { dav })
	}

	if (typeof dav.roomBuildingRoomNumber === 'string') {
		properties.roomBuildingRoomNumber = dav.roomBuildingRoomNumber
	} else if (dav.roomBuildingRoomNumber !== undefined) {
		logger.warn('Could not extract `roomBuildingRoomNumber`.', { dav })
	}

	if (typeof dav.roomFeatures === 'string') {
		const featureParts = dav.roomFeatures.split(',')
		const features = featureParts
			.map((feature) => feature.trim())
			.filter((feature) => feature.length > 0)

		properties.roomFeatures = features
	} else if (dav.roomFeatures !== undefined) {
		logger.warn('Could not extract `roomFeatures`.', { dav })
	}

	if (typeof dav.roomAddress === 'string') {
		properties.roomAddress = dav.roomAddress
	} else if (dav.roomAddress !== undefined) {
		logger.warn('Could not extract `roomAddress`.', { dav })
	}

	return properties
}

export { mapDavToRoomPrincipalProperties }

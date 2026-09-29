/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Raw principal object as returned by a cdav-library principal search
 * before it is normalized into a {@link BasePrincipalProperties}-shaped model.
 *
 * @see {@link https://github.com/nextcloud/cdav-library/blob/main/src/models/principal.js} for the available properties
 */
export interface RawDavPrincipal {
	calendarUserType: string
	groupId: string
	userId: string
	principalScheme: string
	url: string
	displayname: string
	email?: string
}

/**
 * Properties shared between all principal types.
 */
export interface BasePrincipalProperties {
	id: string
	displayname: string | null
	emailAddress: string | null
	calendarUserType: string
}

export interface RoomPrincipal extends RoomPrincipalProperties, BasePrincipalProperties {}

/**
 * Properties specific to a {@link RoomPrincipal}
 *
 * @remarks
 * Each property is `null` when it was not set on the original
 * `cdav-library` dav principal object, or when the value was invalid.
 */
export interface RoomPrincipalProperties {
	/**
	 * Type of room.
	 * `null` if not provided or invalid.
	 */
	roomType: string | null
	/**
	 * Maximum number of people the room can seat.
	 * `null` if not provided or invalid.
	 */
	roomSeatingCapacity: number | null
	/**
	 * Name of the the building the room is in.
	 * `null` if not provided or invalid.
	 */
	roomBuildingName: string | null
	/**
	 * Street address of the building the room is in.
	 * `null` if not provided or invalid.
	 */
	roomBuildingAddress: string | null
	/**
	 * Floor/story of the building the room is on.
	 * `null` if not provided or invalid.
	 */
	roomBuildingStory: string | null
	/**
	 * Room number within the building.
	 * `null` if not provided or invalid.
	 */
	roomBuildingRoomNumber: string | null
	/**
	 * Features available in the room.
	 * `null` if not set or invalid.
	 * `[]` if set with no features.
	 */
	roomFeatures: string[] | null
	/**
	 * Address of the room itself.
	 * `null` if not set or invalid.
	 */
	roomAddress: string | null
}

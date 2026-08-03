export interface RoomPrincipal {
	id: string | null
	displayname: string | null
	emailAddress: string | null
	calendarUserType: string
	isAvailable: boolean
	roomSeatingCapacity: string | null
	roomType: string | null
	roomAddress: string | null
	roomFeatures: string | null
	roomNumber: string | null
	roomFloor: string | null
	roomBuildingName: string | null
	roomBuildingAddress: string | null
}

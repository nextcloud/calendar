export function dateFactory() {
	return new Date()
}

export function getYYYYMMDDFromDate(date) {
	return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
		.toISOString()
		.split('T')[0]
}

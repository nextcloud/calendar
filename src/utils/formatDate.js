export function formatInTimezone(dateInput, timezoneId) {
    if (!dateInput) return ''

    const date = new Date(dateInput)

    return new Intl.DateTimeFormat(undefined, {
        timeZone: timezoneId,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(date)
}


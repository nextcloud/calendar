/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { errorCatch } from '../utils/errors.js'

/**
 * Adds data to the html element representing the event in the fullcalendar grid.
 * This is used to later on position the popover
 *
 * @param {object} data The destructuring object
 * @param {EventApi} data.event The fullcalendar event object
 * @param {Node} data.el The HTML element
 */
export default errorCatch(function({ event, el }) {
	if (el.classList.contains('fc-event-nc-alarms')) {
		const notificationIcon = document.createElement('span')
		notificationIcon.classList.add('icon-event-reminder')
		if (event.extendedProps.darkText) {
			notificationIcon.classList.add('icon-event-reminder--dark')
		} else {
			notificationIcon.classList.add('icon-event-reminder--light')
		}
		el.firstChild.appendChild(notificationIcon)
	}

	if (el.classList.contains('fc-event-nc-task')) {
		if (el.classList.contains('fc-list-event')) {
			// List view
			const dotElement = el.querySelector('.fc-list-event-dot')
			dotElement.classList.remove('fc-list-event-dot')
			dotElement.classList.add('fc-list-event-checkbox')
			dotElement.style.color = 'var(--color-main-text)'

			if (event.extendedProps.percent === 100) {
				dotElement.classList.add('calendar-grid-checkbox-checked')
			} else {
				dotElement.classList.add('calendar-grid-checkbox')
			}
		} else if (el.classList.contains('fc-daygrid-dot-event')) {
			// Dot event in day grid view
			const dotElement = el.querySelector('.fc-daygrid-event-dot')
			dotElement.classList.remove('fc-daygrid-event-dot')
			dotElement.classList.add('fc-daygrid-event-checkbox')
			dotElement.style.color = 'var(--color-main-text)'

			if (event.extendedProps.percent === 100) {
				dotElement.classList.add('calendar-grid-checkbox-checked')
			} else {
				dotElement.classList.add('calendar-grid-checkbox')
			}
		} else {
			// AgendaView and all-day grid view
			const titleContainer = el.querySelector('.fc-event-title-container')
			const checkboxElement = document.createElement('div')
			checkboxElement.classList.add('fc-event-title-checkbox')
			if (event.extendedProps.percent === 100) {
				checkboxElement.classList.add('calendar-grid-checkbox-checked')
			} else {
				checkboxElement.classList.add('calendar-grid-checkbox')
			}

			titleContainer.prepend(checkboxElement)
		}
	}

	if (event.source === null) {
		el.dataset.isNew = 'yes'
	} else {
		el.dataset.objectId = event.extendedProps.objectId
		el.dataset.recurrenceId = event.extendedProps.recurrenceId
	}

	if (el.classList.contains('fc-list-event')) {
		const locationContainer = document.createElement('td')
		locationContainer.classList.add('fc-list-event-location')
		const descriptionContainer = document.createElement('td')
		descriptionContainer.classList.add('fc-list-event-description')

		el.appendChild(locationContainer)
		el.appendChild(descriptionContainer)

		if (event.extendedProps.location) {
			const location = document.createElement('span')
			location.appendChild(document.createTextNode(event.extendedProps.location))
			locationContainer.appendChild(location)
		}

		if (event.extendedProps.description) {
			const description = document.createElement('span')
			description.appendChild(document.createTextNode(event.extendedProps.description))
			descriptionContainer.appendChild(description)
		}
	}

	// Apply semi-transparent background for grid events (not dot or list events).
	// The full-opacity color remains on the left border (set by FullCalendar's inline border-color).
	// Past events get a stronger fill to keep them visually distinct.
	// Skipped in high-contrast mode — CSS will force the plain page background instead.
	if (
		!el.classList.contains('fc-list-event')
		&& !el.classList.contains('fc-daygrid-dot-event')
		&& !isHighContrast()
	) {
		const bgColor = el.style.backgroundColor
		if (bgColor) {
			const rgb = extractRGB(bgColor)
			if (rgb) {
				const now = new Date()
				const isPast = event.end ? event.end < now : (event.start ? event.start < now : false)
				const opacity = isPast ? 0.05 : 0.35
				el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
			}
		}
	}

	if (
		el.classList.contains('fc-event-nc-all-declined')
		|| el.classList.contains('fc-event-nc-needs-action')
		|| el.classList.contains('fc-event-nc-declined')
	) {
		const titleElement = el.querySelector('.fc-event-title')
		const timeElement = el.querySelector('.fc-event-time')
		const dotElement = el.querySelector('.fc-daygrid-event-dot')

		if (dotElement) {
			dotElement.style.borderWidth = '2px'
			dotElement.style.background = 'var(--fc-page-bg-color)'
			dotElement.style.minWidth = '10px'
			dotElement.style.minHeight = '10px'
		} else {
			el.style.background = 'transparent'

			if (!isHighContrast()) {
				const now = new Date()
				const isPast = event.end ? event.end < now : (event.start ? event.start < now : false)
				const borderRgb = extractRGB(el.style.borderColor)
				if (isPast && borderRgb) {
					const fadedBorderColor = `rgba(${borderRgb.r}, ${borderRgb.g}, ${borderRgb.b}, 0.35)`
					el.style.borderTopColor = fadedBorderColor
					el.style.borderRightColor = fadedBorderColor
					el.style.borderBottomColor = fadedBorderColor
				}
			}
		}

		if (titleElement) {
			titleElement.style.color = 'var(--color-main-text)'
		}

		if (timeElement) {
			timeElement.style.color = 'var(--color-main-text)'
		}

		el.title = t('calendar', 'All participants declined')

		if (el.classList.contains('fc-event-nc-needs-action')) {
			el.title = t('calendar', 'Please confirm your participation')
		}

		if (el.classList.contains('fc-event-nc-declined')) {
			el.title = t('calendar', 'You declined this event')
			if (titleElement) {
				titleElement.style.textDecoration = 'line-through'
			}
		}
	}

	if (
		event.extendedProps.attendeeCount >= 1
		&& !el.classList.contains('fc-event-nc-task')
	) {
		prependTitleIcon(el, 'M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm640 0v-112q0-51-26-95.5T586-441q51 6 98 20.5t84 35.5q36 20 57 44.5t21 52.5v112H680ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z')
	}

	if (el.classList.contains('fc-event-nc-all-declined')) {
		prependTitleIcon(el, 'm40-120 440-760 440 760H40Zm440-120q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Z')
	}

	if (el.classList.contains('fc-event-nc-tentative')) {
		const dotElement = el.querySelector('.fc-daygrid-event-dot')

		if (dotElement) {
			// Dot events: keep the existing marker fill and overlay stripes only.
			const dotColor = dotElement.style.borderColor || el.style.borderColor
			const dotRgb = extractRGB(dotColor)
			const stripeColor = dotRgb ? `rgba(${dotRgb.r}, ${dotRgb.g}, ${dotRgb.b}, 0.25)` : dotColor
			dotElement.style.borderWidth = '2px'
			if (!isHighContrast()) {
				dotElement.style.backgroundImage = `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 1px, transparent 1px, transparent 3.5px)`
			}
			dotElement.style.minWidth = '10px'
			dotElement.style.minHeight = '10px'
		} else if (!isHighContrast()) {
			// Block/time events: keep the existing fill and overlay stripes only.
			const eventColor = el.style.borderColor
			const rgb = extractRGB(eventColor)
			if (rgb) {
				const stripeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`
				el.style.backgroundImage = `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 2px, transparent 2px, transparent 10px)`
			} else {
				// Fallback for when border color can't be parsed
				const baseColor = el.style.backgroundColor
				const stripeColor = darkenColor(baseColor)
				el.style.backgroundImage = `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 2px, transparent 2px, transparent 10px)`
			}
		}

		el.title = t('calendar', 'Your participation is tentative')
	}
}, 'eventDidMount')

/**
 * Prepend a Material Symbols SVG icon to an event's title element.
 * The icon is coloured with the event's border colour and sized to match the text.
 *
 * @param {HTMLElement} el The root element of the fullcalendar event
 * @param {string} svgPath The `d` attribute of the SVG path to render
 */
function prependTitleIcon(el, svgPath) {
	const titleElement = el.querySelector('.fc-event-title')
	if (!titleElement) {
		return
	}

	// Avoid duplicating icons when eventDidMount is called again (e.g. after a click).
	const existingSvgs = titleElement.querySelectorAll('svg')
	for (const svg of existingSvgs) {
		const path = svg.querySelector('path')
		if (path && path.getAttribute('d') === svgPath) {
			return
		}
	}

	const svgNS = 'http://www.w3.org/2000/svg'
	const svgElement = document.createElementNS(svgNS, 'svg')
	svgElement.setAttribute('viewBox', '0 -960 960 960')
	const pathElement = document.createElementNS(svgNS, 'path')
	pathElement.setAttribute('d', svgPath)
	svgElement.appendChild(pathElement)
	svgElement.style.fill = el.style.borderColor
	svgElement.style.width = '1em'
	svgElement.style.marginBottom = '0.2em'
	svgElement.style.verticalAlign = 'middle'
	titleElement.insertBefore(svgElement, titleElement.firstChild)
}

/**
 * Extract RGB components from a CSS color string.
 * Supports rgb(), rgba(), #rrggbb, and #rgb formats.
 *
 * @param {string} color The color string to parse
 * @return {{r: number, g: number, b: number}|null}
 */
function extractRGB(color) {
	if (!color) {
		return null
	}

	// rgb() or rgba() — browser-normalised inline style values
	const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
	if (rgbMatch) {
		return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }
	}

	// #rrggbb
	const hexMatch = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
	if (hexMatch) {
		return {
			r: parseInt(hexMatch[1], 16),
			g: parseInt(hexMatch[2], 16),
			b: parseInt(hexMatch[3], 16),
		}
	}

	// #rgb
	const shortHexMatch = color.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
	if (shortHexMatch) {
		return {
			r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
			g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
			b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16),
		}
	}

	return null
}

/**
 * Create a slightly darker color for background stripes.
 * Handles rgb(), rgba(), and hex color formats.
 *
 * @param {string} color The color to darken
 * @return {string} The darkened color
 */
function darkenColor(color) {
	const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
	if (!match) {
		return color
	}
	const [r, g, b] = [match[1], match[2], match[3]].map((c) => Math.max(0, Math.min(255, parseInt(c) - (parseInt(c) * 0.3))))
	if (match[4] !== undefined) {
		return `rgba(${r}, ${g}, ${b}, ${match[4]})`
	}
	return `rgb(${r}, ${g}, ${b})`
}

/**
 * Returns true when the user has requested a high-contrast experience.
 *
 * Nextcloud lets users pick a high-contrast theme from their Accessibility
 * settings. That sets data-themes="light-highcontrast" (or dark-highcontrast)
 * on <body> — it does NOT necessarily trigger the OS-level
 * `prefers-contrast: more` media feature, so we check both.
 *
 * @return {boolean}
 */
function isHighContrast() {
	if (window.matchMedia('(prefers-contrast: more)').matches) {
		return true
	}
	const themes = document.body.getAttribute('data-themes') ?? ''
	return themes.includes('highcontrast')
}

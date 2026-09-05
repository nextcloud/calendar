/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Allocates a DOM element containing the given SVG icon
 * It is recommended to always use SVG icons from vue-material-design-icons and
 * to specify the original file from which SVG has been retrieved
 *
 * @param content SVG path data of the icon
 * @return The element to append to the DOM
 */
export function createSvgIconElement(content: string): SVGSVGElement {
	const svgNS = 'http://www.w3.org/2000/svg'
	const svgElement = document.createElementNS(svgNS, 'svg')
	svgElement.setAttribute('viewBox', '0 0 24 24')
	const pathElement = document.createElementNS(svgNS, 'path')
	pathElement.setAttribute('d', content)
	svgElement.appendChild(pathElement)
	return svgElement
}

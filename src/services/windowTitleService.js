/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import dateRangeFormat from '../filters/dateRangeFormat.js'
import { getDateFromFirstdayParam } from '../utils/date.js'
import useSettingsStore from '../store/settings.js'

const originalWindowTitle = document.title

/**
 * This function listens to the router and
 * automatically adjusts the title of the window
 *
 * @param {VueRouter} router The VueJS Router instance
 */
export default function(router) {
	const settingsStore = useSettingsStore()

	/**
	 * Updates the title of the window
	 *
	 * @param {Date} date viewed Date
	 * @param {string} view Name of the current view
	 * @param {string} locale Locale to be used for formatting
	 */
	function updateTitle(date, view, locale) {
		const title = dateRangeFormat(date, view, locale)
		document.title = [
			title,
			originalWindowTitle,
		].join(' - ')
	}

	/**
	 * This listens to router changes and automatically
	 * updates the title
	 */
	router.beforeEach((to, from, next) => {
		if (!to.params.firstDay) {
			next()
			return
		}

		const date = getDateFromFirstdayParam(to.params.firstDay)
		const view = to.params.view
		const locale = settingsStore.momentLocale

		updateTitle(date, view, locale)

		next()
	})

	/**
	 * This listens to changes of the locale
	 * and automatically updates it.
	 */
	settingsStore.$onAction(({
		name,
		store,
		args,
	}) => {
		if (name !== 'setMomentLocale') {
			return
		}
		if (!router.currentRoute.params?.firstDay) {
			return
		}

		const date = getDateFromFirstdayParam(router.currentRoute.params.firstDay)
		const view = router.currentRoute.params.view
		const { locale } = args[0] // JavaScript, I love it ...

		updateTitle(date, view, locale)
	})
}

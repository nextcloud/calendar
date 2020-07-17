/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import dateRangeFormat from '../filters/dateRangeFormat.js'
import { getDateFromFirstdayParam } from '../utils/date.js'

const originalWindowTitle = document.title

/**
 * This function listens to the router and
 * automatically adjusts the title of the window
 *
 * @param {VueRouter} router The VueJS Router instance
 * @param {Store} store The vuex store
 */
export default function(router, store) {
	/**
	 * Updates the title of the window
	 *
	 * @param {Date} date viewed Date
	 * @param {String} view Name of the current view
	 * @param {String} locale Locale to be used for formatting
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
		const locale = store.state.settings.momentLocale

		updateTitle(date, view, locale)

		next()
	})

	/**
	 * This listens to changes of the locale
	 * and automatically updates it.
	 */
	store.subscribe(mutation => {
		if (mutation.type !== 'setMomentLocale') {
			return
		}

		const date = getDateFromFirstdayParam(router.currentRoute.params.firstDay)
		const view = router.currentRoute.params.view
		const locale = mutation.payload

		updateTitle(date, view, locale)
	})
}

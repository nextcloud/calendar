/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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

import Vue from 'vue'
import Router from 'vue-router'
import Calendar from './views/Calendar'
import EditSimple from './views/EditSimple'
import EditSidebar from './views/EditSidebar'
import { getDateFromFirstdayParam } from './services/date.js'
import { getConfigValueFromHiddenInput } from './services/settingsService'
import moment from 'nextcloud-moment'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	base: OC.linkTo('calendar', 'index.php'),
	routes: [
		{
			path: '/',
			name: 'Root',
			redirect: {
				name: 'CalendarView',
				params: {
					view: getConfigValueFromHiddenInput('initial-view') || 'month',
					firstDay: 'now'
				},
			}
		},
		// {
		// 	// This route can be used in order to link to events without knowing it's date
		// 	path: '/edit/:object',
		//	name: 'EditNoDateNoRecurrenceId',
		// 	redirect: {
		// 		name: 'Edit',
		//
		// 	}
		// },
		// {
		// 	// This route can be used in order to link to events without knowing it's date
		// 	path: '/edit/:object/:recurrenceId',
		// 	name: 'EditNoDate',
		// 	redirect: {
		// 		name: 'Edit',
		//
		// 	}
		// },
		{
			path: '/:view/:firstDay',
			component: Calendar,
			name: 'CalendarView',
			children: [
				// {
				// 	path: '',
				// 	name: 'CalendarView',
				// },
				{
					path: '/:view/:firstDay/edit/popover/:object/:recurrenceId',
					name: 'EditPopoverView',
					component: EditSimple,
				},
				{
					path: '/:view/:firstDay/edit/sidebar/:object/:recurrenceId',
					name: 'EditSidebarView',
					component: EditSidebar,
				},
				{
					path: '/:view/:firstDay/new/popover/:allDay/:dtstart/:dtend',
					name: 'NewPopoverView',
					component: EditSimple,
				},
				{
					path: '/:view/:firstDay/new/sidebar/:allDay/:dtstart/:dtend',
					name: 'NewSidebarView',
					component: EditSidebar,
				},
			],
		},
	],
})

const originalTitle = document.title
router.beforeEach((to, from, next) => {
	if (!to.params.firstDay) {
		next()
		return
	}

	const date = getDateFromFirstdayParam(to.params.firstDay)
	const currentView = to.params.view

	switch (currentView) {
	case 'agendaDay':
		document.title = moment(date).format('ll') + ' - ' + originalTitle
		break

	case 'agendaWeek':
		document.title = t('calendar', 'Week {number} of {year}', {
			number: moment(date).week(),
			year: moment(date).year()
		}) + ' - ' + originalTitle
		break

	case 'month':
	default:
		document.title = moment(date).format('MMMM YYYY') + ' - ' + originalTitle
	}

	next()
})

export default router

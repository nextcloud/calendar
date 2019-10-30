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
import { generateUrl } from '@nextcloud/router'

import Calendar from './views/Calendar'
import EditSimple from './views/EditSimple'
import EditSidebar from './views/EditSidebar'
import windowTitleService from './services/windowTitleService.js'
import { getInitialView } from './utils/router.js'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	base: generateUrl('/apps/calendar'),
	routes: [
		{
			path: '/p/:tokens/:view/:firstDay',
			component: Calendar,
			name: 'PublicCalendarView',
			children: [
				{
					path: '/p/:tokens/:view/:firstDay/view/popover/:object/:recurrenceId',
					name: 'PublicEditPopoverView',
					component: EditSimple,
				},
				{
					path: '/p/:tokens/:view/:firstDay/view/sidebar/:object/:recurrenceId',
					name: 'PublicEditSidebarView',
					component: EditSidebar,
				},
			],
		},
		{
			path: '/embed/:tokens/:view/:firstDay',
			component: Calendar,
			name: 'EmbedCalendarView',
			children: [
				{
					path: '/embed/:tokens/:view/:firstDay/view/popover/:object/:recurrenceId',
					name: 'EmbedEditPopoverView',
					component: EditSimple,
				},
				{
					path: '/embed/:tokens/:view/:firstDay/view/sidebar/:object/:recurrenceId',
					name: 'EmbedEditSidebarView',
					component: EditSidebar,
				},
			],
		},
		/**
		 * This route is the root-view that does not contain any parameters so far.
		 * Users usually access it by clicking the calendar-icon in the navigation bar.
		 *
		 * It automatically redirects you to the calendar view, showing the current month
		 * in the user's preferred view.
		 */
		{
			path: '/',
			redirect: `/${getInitialView()}/now`,
		},
		{
			path: '/p/:tokens/:fancyName?',
			redirect: `/p/:tokens/${getInitialView()}/now`,
		},
		{
			path: '/public/:tokens/:fancyName?',
			redirect: `/p/:tokens/${getInitialView()}/now`,
		},
		{
			path: '/embed/:tokens',
			redirect: `/embed/:tokens/${getInitialView()}/now`,
		},
		{
			path: '/edit/:object',
			redirect: `/${getInitialView()}/now/edit/sidebar/:object/next`,
		},
		{
			path: '/edit/:object/:recurrenceId',
			redirect: `/${getInitialView()}/now/edit/sidebar/:object/:recurrenceId`,
		},
		/**
		 * This is the main route that contains the current view and viewed day
		 * It has to be last, so that other routes starting with /p/, etc. match first
		 *
		 *
		 *
		 */
		{
			path: '/:view/:firstDay',
			component: Calendar,
			name: 'CalendarView',
			children: [
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

windowTitleService(router)

export default router

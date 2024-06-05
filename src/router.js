/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import Router from 'vue-router'
import { getRootUrl, generateUrl } from '@nextcloud/router'

import Calendar from './views/Calendar.vue'
import EditSimple from './views/EditSimple.vue'
import EditSidebar from './views/EditSidebar.vue'
import {
	getDefaultEndDateForNewEvent,
	getDefaultStartDateForNewEvent,
	getInitialView,
	getPreferredEditorRoute,
} from './utils/router.js'

Vue.use(Router)

const webRootWithIndexPHP = getRootUrl() + '/index.php'
const doesURLContainIndexPHP = window.location.pathname.startsWith(webRootWithIndexPHP)
const base = generateUrl('apps/calendar', {}, {
	noRewrite: doesURLContainIndexPHP,
})

const router = new Router({
	mode: 'history',
	base,
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
			path: '/new/:view?',
			redirect: (to) => `/${to.params.view ?? getInitialView()}/now/new/${getPreferredEditorRoute()}/0/${getDefaultStartDateForNewEvent()}/${getDefaultEndDateForNewEvent()}`,
		},
		{
			path: '/new/:allDay/:dtstart/:dtend',
			redirect: () => `/${getInitialView()}/:dtstart/new/${getPreferredEditorRoute()}/:allDay/:dtstart/:dtend`,
		},
		{
			path: '/edit/:object',
			redirect: () => `/${getInitialView()}/now/edit/${getPreferredEditorRoute()}/:object/next`,
		},
		{
			path: '/edit/:object/:recurrenceId',
			redirect: () => `/${getInitialView()}/now/edit/${getPreferredEditorRoute()}/:object/:recurrenceId`,
		},
		/**
		 * This is the main route that contains the current view and viewed day
		 * It has to be last, so that other routes starting with /p/, etc. match first
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

export default router

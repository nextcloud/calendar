import Vue from 'vue'
import Router from 'vue-router'
import Calendar from './views/Calendar'
import EditSimple from './views/EditSimple'
import EditSidebar from './views/EditSidebar'

import { dateFactory, getYYYYMMDDFromDate } from './services/date.js'

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
					view: oca_calendar.initialView,
					firstday: getYYYYMMDDFromDate(dateFactory())
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
			path: '/:view/:firstday',
			component: Calendar,
			name: 'CalendarView',
			children: [
				// {
				// 	path: '',
				// 	name: 'CalendarView',
				// },
				{
					path: '/:view/:firstday/edit/popover/:object/:recurrenceId',
					name: 'EditPopoverView',
					component: EditSimple,
				},
				{
					path: '/:view/:firstday/edit/sidebar/:object/:recurrenceId',
					name: 'EditSidebarView',
					component: EditSidebar,
				},
				{
					path: '/:view/:firstday/new/popover/:allDay/:dtstart/:dtend',
					name: 'NewPopoverView',
					component: EditSimple,
				},
				{
					path: '/:view/:firstday/new/sidebar/:allDay/:dtstart/:dtend',
					name: 'NewSidebarView',
					component: EditSidebar,
				},
			],
		},
	],
})

export default router

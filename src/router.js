import Vue from 'vue'
import Router from 'vue-router'
import Calendar from './views/Calendar'
import Edit from './views/Edit'
import { dateFactory, getYYYYMMDDFromDate } from './services/date.js'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	base: OC.linkTo('calendar', 'index.php'),
	routes: [
		{
			path: '/',
			name: 'Root',
			component: Calendar,
			redirect: {
				name: 'View',
				params: {
					view: oca_calendar.initialView,
					firstday: getYYYYMMDDFromDate(dateFactory())
				},
			}
		},
		{
			path: '/:view/:firstday',
			children: [
				{
					path: '/',
					name: 'View',
					component: Calendar,
				},
				{
					path: '/edit/:mode/:object/:recurrenceId',
					name: 'Edit',
					component: Edit,
				},
				{
					path: '/new/:mode/:dtstart/:dtend',
					name: 'Edit',
					component: Edit,
				},
			],
		},
	],
})

export default router

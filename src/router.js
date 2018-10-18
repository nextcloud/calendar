import Vue from 'vue'
import Router from 'vue-router'
import View from './components/View'
import Edit from './components/Edit'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	base: OC.generateUrl('/apps/calendar'),
	routes: [
		{
			path: '/',
			name: 'Root',
			component: View,
			// redirect: {
			// 	name: 'View',
			// 	params: {
			// 		view: 'now',
			// 		firstday: 'now'
			// 	},
			// }
		},
		{
			path: '/{view}/{firstday}',
			props: true,
			children: [
				{
					path: '/',
					name: 'View',
					component: View,
					props: true
				},
				{
					path: '/edit/{mode}/{object}/{recurrence}',
					name: 'Edit',
					component: Edit,
					props: true
				},
				{
					path: '/new/{mode}/{recurrence}',
					name: 'Edit',
					component: Edit,
					props: true,
				},
			],
		},
	],
})

export default router

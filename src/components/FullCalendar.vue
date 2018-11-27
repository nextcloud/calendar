<!--
  - @copyright Copyright (c) 2018 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div id="fullcalendar" />
</template>

<script>
import { Calendar } from 'fullcalendar'
import '../../node_modules/fullcalendar/dist/fullcalendar.css'
import debounce from 'debounce'

import '../fullcalendar/timeZoneImpl'

export default {
	name: 'FullCalendar',
	props: {
		// single events used for new event, etc.
		events: {
			type: Array,
			default() {
				return []
			}
		},
		// event sources for calendars
		eventSources: {
			type: Array,
			default() {
				return []
			}
		},
		// config options
		config: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			defaultConfig: {
				defaultView: 'month',
				editable: true,
				forceEventDuration: true,
				header: false,
				// locale: null,
				slotDuration: '00:15:00',
				nowIndicator: true,
				weekNumbers: false, // TODO is this the default in view controller?
				weekends: true,
				eventSources: this.eventSources,
				timeZone: 'UTC',
				timeZoneImpl: 'vtimezone-timezone',
				eventClick: ({ event }) => {
					const params = this.$route.params

					params.object = event.extendedProps.routerParams.object
					params.recurrenceId = event.extendedProps.routerParams.recurrenceId

					this.$router.push({ name: 'EditSidebarView', params })
				},
				eventRender: ({ event, el }) => {
					console.debug(el)
					// TODO - add popover
					// TODO - add categories
					// TODO - add participation status
				}
			},
			calendar: null,
			currentDate: null
		}
	},
	watch: {
		events: {
			deep: true,
			handler(newEvents, oldEvents) {

			}
		},
		eventSources: {
			deep: true,
			handler(newEventSources, oldEventSources) {
				const toAdd = newEventSources.filter((es) => oldEventSources.find((oes) => es.id === oes.id) === undefined)
				const toRemove = oldEventSources.filter((oes) => newEventSources.find((es) => es.id === oes.id) === undefined)

				toAdd.forEach((es) => {
					this.calendar.addEventSource(es)
				})
				toRemove.forEach((es) => {
					this.calendar.getEventSourceById(es.id).remove()
				})
			}
		},
		config: {
			deep: true,
			handler(newConfig, oldConfig) {
				if (newConfig.timeZone !== oldConfig.timeZone) {
					this.calendar.setOption('timeZoneParam', newConfig.timeZone)
					this.calendar.refetchEvents()
				}

				if (newConfig.weekNumbers !== oldConfig.weekNumbers) {
					this.calendar.setOption('weekNumbers', newConfig.weekNumbers)
				}

				if (newConfig.weekends !== oldConfig.weekends) {
					this.calendar.setOption('weekends', newConfig.weekends)
				}
			}
		},
		'$route'({ params }) {
			if (params.view !== this.calendar.getView().type) {
				this.calendar.changeView(params.view)

			}

			if (params.firstday !== this.currentDate) {
				this.calendar.gotoDate(params.firstday)
				this.currentDate = params.firstday
			}
		}
	},
	mounted: function() {
		window.addEventListener('resize', debounce(() => {
			const windowHeight = window.innerHeight
			const headerHeight = document.getElementById('header').clientHeight

			this.calendar.setOption('height', windowHeight - headerHeight)
		}, 500))

		const windowHeight = window.innerHeight
		const headerHeight = document.getElementById('header').clientHeight
		const height = windowHeight - headerHeight

		this.calendar = new Calendar(this.$el,
			Object.assign({}, { height }, this.defaultConfig, this.config))
		this.calendar.render()
	},
	beforeDestroy: () => {

	}
}
</script>

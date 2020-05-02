<template>
  <div class='demo-app'>
    <div class='demo-app-top'>
      <button @click="changeExtendedListWeekView">Change view to extended list week view</button>
    </div>
    <FullCalendar
      class='demo-app-calendar'
      ref="fullCalendar"
      defaultView="extendedListMonth"
      :header="{
        left: 'prev,next today',
        center: 'title',
        right: 'extendedListDay,extendedListWeek,extendedListMonth'
      }"
	  :views="{
        extendedListDay: { buttonText: 'Day' },
        extendedListMonth: { buttonText: 'Month' },
        extendedListWeek: { buttonText: 'Week' }
      }"
      :plugins="calendarPlugins"
      :weekends="calendarWeekends"
      :events="calendarEvents"
      @dateClick="handleDateClick"
      />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import customViewPlugin from './extended-list.js'


export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data: function() {
    return {
      calendarPlugins: [ // plugins must be defined in the JS
        dayGridPlugin,
        timeGridPlugin,
		customViewPlugin,
        interactionPlugin // needed for dateClick
      ],
      calendarWeekends: true,
      calendarEvents: [ // initial event data
        { title: 'Event Now', 
		  start: new Date(),
		  location: 'conference room',locationTitle: 'Be here before eight!',
		  description: 'Meeting regarding intergating new 3rd party application.',
		  descriptionTitle: 'Be here before eight!' }
      ]
    }
  },
  methods: {
    changeExtendedListWeekView() {
      let calendarApi = this.$refs.fullCalendar.getApi() 
      calendarApi.changeView('extendedListWeek') // call a method on the Calendar object
    },
    handleDateClick(arg) {
      if (confirm('Would you like to add an event to ' + arg.dateStr + ' ?')) {
        this.calendarEvents.push({ // add new event data
          title: 'New Event',
          start: arg.date,
          allDay: arg.allDay
        })
      }
    }
  }
}

</script>

<style lang='scss'>

// you must include each plugins' css
// paths prefixed with ~ signify node_modules
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css';
@import '~@fullcalendar/timegrid/main.css';

@import './extended-list.css';

.demo-app {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-top {
  margin: 0 0 3em;
}

.demo-app-calendar {
  margin: 0 auto;
  max-width: 900px;
}

</style>

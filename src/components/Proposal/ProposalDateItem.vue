<template>
  <div>
    <span>{{ formattedDate }}</span>
  </div>
</template>

<script>
import moment from 'moment-timezone';

export default {
  props: {
    date: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  computed: {
    formattedDate() {
      return moment.tz(this.date, this.timezone).format('YYYY-MM-DD HH:mm:ss');
    },
  },
};
</script>
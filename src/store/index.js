import Vue from 'vue'
import Vuex from 'vuex'
import calendars from './calendars'
Vue.use(Vuex)

const mutations = {}

export default new Vuex.Store({
	modules: {
		calendars,
	},

	mutations
})

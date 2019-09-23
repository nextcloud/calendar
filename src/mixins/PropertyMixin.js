/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
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
import EventComponent from 'calendar-js/src/components/root/eventComponent'

/**
 * This is a mixin for properties. It contains common Vue stuff, that is
 * required commonly by all components like the event, read-only-status, etc.
 *
 * See inline for more documentation
 */
export default {
	props: {
		// This is coming from rfcProps
		propModel: {
			type: Object,
			required: true
		},
		isReadOnly: {
			type: Boolean,
			required: true
		},
		eventComponent: {
			validator: prop => prop instanceof EventComponent || prop === null,
			required: true
		}
	},
	computed: {
		icon() {
			return this.propModel.icon || ''
		},
		placeholder() {
			return this.propModel.placeholder || ''
		},
		info() {
			return this.propModel.info || ''
		},
		readableName() {
			return this.propModel.readableName || ''
		},
		hasInfo() {
			return this.propModel.info !== undefined
		},
		eventComponentLoaded() {
			return this.eventComponent !== null
		}
	}
}

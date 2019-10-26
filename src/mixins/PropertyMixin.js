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

/**
 * This is a mixin for properties. It contains common Vue stuff, that is
 * required commonly by all components like the event, read-only-status, etc.
 *
 * See inline for more documentation
 */
export default {
	props: {
		/**
		 * The prop-model object containing information about the
		 * displayed property. The information comes straight from
		 * /src/models/rfcProps.js
		 */
		propModel: {
			type: Object,
			required: true
		},
		/**
		 * An indicator whether or not the event is being viewed
		 * in read-only mode
		 */
		isReadOnly: {
			type: Boolean,
			required: true
		},
		/**
		 * The value to be displayed inside the property.
		 * The type varies from property to property.
		 */
		value: {
			required: true
		}
	},
	computed: {
		/**
		 * Returns the icon stored in the property-model
		 * If there is no icon set, it returns an empty string
		 *
		 * @returns {string}
		 */
		icon() {
			return this.propModel.icon || ''
		},
		/**
		 * Returns the placeholder text stored in the property-model
		 * If there is no placeholder text set, it returns an empty string
		 *
		 * @returns {string}
		 */
		placeholder() {
			return this.propModel.placeholder || ''
		},
		/**
		 * Returns the placeholder text for tags stored in the property-model
		 * If there is no placeholder text for tags set, it returns an empty string
		 *
		 * @returns {string}
		 */
		tagPlaceholder() {
			return this.propModel.tagPlaceholder || ''
		},
		/**
		 * Returns the info text stored in the property-model
		 * If there is no info text set, it returns an empty string
		 *
		 * @returns {string}
		 */
		info() {
			return this.propModel.info || ''
		},
		/**
		 * Returns the property's readable name stored in the property-model
		 * If there is no readable name set, it returns an empty string
		 *
		 * @returns {string}
		 */
		readableName() {
			return this.propModel.readableName || ''
		},
		/**
		 * Returns whether or not to display the info text.
		 * The info text will only be displayed if there
		 * is actually an info set and if the event is viewed
		 * with edit permission.
		 *
		 * @returns {boolean}
		 */
		hasInfo() {
			return this.propModel.info !== undefined && !this.isReadOnly
		}
	}
}

/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

app.service('XMLUtility', function() {
	'use strict';

	const context = {};
	context.XMLify = function(xmlDoc, parent, json) {
		const element = xmlDoc.createElement(json.name);

		for (let key in json.attributes) {
			if (json.attributes.hasOwnProperty(key)) {
				element.setAttribute(key, json.attributes[key]);
			}
		}

		if (json.value) {
			element.textContent = json.value;
		} else if (json.children) {
			for (let key in json.children) {
				if (json.children.hasOwnProperty(key)) {
					context.XMLify(xmlDoc, element, json.children[key]);
				}
			}
		}

		parent.appendChild(element);
	};

	const serializer = new XMLSerializer();

	this.getRootSceleton = function() {
		if (arguments.length === 0) {
			return {};
		}

		const sceleton = {
			name: arguments[0],
			attributes: {
				'xmlns:c': 'urn:ietf:params:xml:ns:caldav',
				'xmlns:d': 'DAV:',
				'xmlns:a': 'http://apple.com/ns/ical/',
				'xmlns:o': 'http://owncloud.org/ns'
			},
			children: []
		};

		let childrenWrapper = sceleton.children;

		const args = Array.prototype.slice.call(arguments, 1);
		args.forEach(function(argument) {
			const level = {
				name: argument,
				children: []
			};
			childrenWrapper.push(level);
			childrenWrapper = level.children;
		});

		return sceleton;
	};

	this.serialize = function(json) {
		json = json || {};
		if (typeof json !== 'object' || !json.hasOwnProperty('name')) {
			return '';
		}

		const root = document.implementation.createDocument('', '', null);
		context.XMLify(root, root, json);

		return serializer.serializeToString(root.firstChild);
	};
});

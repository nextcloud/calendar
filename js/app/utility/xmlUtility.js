/**
 * Calendar App
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
		const element = xmlDoc.createElementNS(json.name[0], json.name[1]);

		json.attributes = json.attributes || [];
		json.attributes.forEach((a) => {
			if (a.length === 2) {
				element.setAttribute(a[0], a[1]);
			} else {
				element.setAttributeNS(a[0], a[1], a[2]);
			}
		});

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

	this.getRootSkeleton = function() {
		if (arguments.length === 0) {
			return [{}, null];
		}

		const skeleton = {
			name: arguments[0],
			children: []
		};

		let childrenWrapper = skeleton.children;

		const args = Array.prototype.slice.call(arguments, 1);
		args.forEach(function(argument) {
			const level = {
				name: argument,
				children: []
			};
			childrenWrapper.push(level);
			childrenWrapper = level.children;
		});

		return [skeleton, childrenWrapper];
	};

	this.serialize = function(json) {
		json = json || {};
		if (typeof json !== 'object' || !json.hasOwnProperty('name')) {
			return '';
		}

		const root = document.implementation.createDocument('', '', null);
		context.XMLify(root, root, json);

		return serializer.serializeToString(root);
	};
});

/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
app.factory('objectConverter', function () {
	'use strict';

	/**
	 * parsers of supported properties
	 */
	var simpleParser = {
		date: function(data, vevent, multiple, key, propName) {
			var prop;

			if (multiple) {
				simpleParser._createArray(data, key);

				var properties = vevent.getAllProperties(propName);
				var id = 0;
				var group = 0;
				for (prop in properties) {
					prop = properties[prop];
					if (!prop) {
						continue;
					}

					var values = prop.getValues();
					for (var value in values) {
						value = values[value];
						if (prop.type === 'duration') {
							data[key].push({
								'id': id,
								'group': group,
								'type': prop.type,
								'value': value.toSeconds()
							});
						} else {
							data[key].push({
								'id': id,
								'group': group,
								'type': prop.type,
								'value': value.toJSDate()
							});
						}
					}
					id = 0;
					group++;
				}
			} else {
				prop = vevent.getFirstProperty(propName);

				if (prop) {
					if (prop.type === 'duration') {
						data[key] = {
							type: prop.type,
							value: prop.getFirstValue().toSeconds()
						};
					} else {
						data[key] = {
							type: prop.type,
							value: prop.getFirstValue().toJSDate()
						};
					}
				}
			}
		},
		string: function(data, vevent, multiple, key, propName) {
			var prop;

			if (multiple) {
				simpleParser._createArray(data, key);

				var properties = vevent.getAllProperties(propName);
				var id = 0;
				var group = 0;
				for (prop in properties) {
					prop = properties[prop];
					var values = prop.getValues();
					for (var value in values) {
						value = values[value];
						data[key].push({
							id: id,
							group: group,
							type: prop.type,
							value: value
						});
						id++;
					}
					id = 0;
					group++;
				}
			} else {
				prop = vevent.getFirstProperty(propName);
				if (prop) {
					data[key] = {
						type: prop.type,
						value: prop.getFirstValue()
					};
				}
			}
		},
		_createArray: function(data, key) {
			if (!Array.isArray(data[key])) {
				data[key] = [];
			}
		}
	};

	/**
	 * properties supported by event editor
	 */
	var simpleProperties = {
		//General
		summary: {jName: 'summary', multiple: false, parser: simpleParser.string},
		calendarid: {jName: 'x-oc-calid', multiple: false, parser: simpleParser.string},
		location: {jName: 'location', multiple: false, parser: simpleParser.string},
		created: {jName: 'created', multiple: false, parser: simpleParser.date},
		lastModified: {jName: 'last-modified', multiple: false, parser: simpleParser.date},
		//attendees
		organizer: {jName: 'organizer', multiple: false, parser: simpleParser.string},
		//sharing
		permission: {jName: 'x-oc-cruds', multiple: false, parser: simpleParser.string},
		privacyClass: {jName: 'class', multiple: false, parser: simpleParser.string},
		//other
		description: {jName: 'description', multiple: false, parser: simpleParser.string},
		url: {jName: 'url', multiple: false, parser: simpleParser.string},
		status: {jName: 'status', multiple: false, parser: simpleParser.string},
		resources: {jName: 'resources', multiple: true, parser: simpleParser.string}
	};

	/**
	 * specific parsers that check only one property
	 */
	var specificParser = {
		alarm: function(data, vevent) {
			if (!Array.isArray(data.alarm)) {
				data.alarms = [];
			}

			var alarms = vevent.getAllSubcomponents('valarm');
			var id;
			for (id in alarms) {
				var alarm = alarms[id];
				var alarmData = {
					id: id,
					action: {},
					trigger: {},
					repeat: {},
					duration: {},
				};

				simpleParser.string(alarmData, alarm, false, 'action', 'action');
				simpleParser.date(alarmData, alarm, false, 'trigger', 'trigger');
				simpleParser.string(alarmData, alarm, false, 'repeat', 'repeat');
				simpleParser.date(alarmData, alarm, false, 'duration', 'duration');
				specificParser.attendee(alarmData, alarm);

				if (alarm.hasProperty('trigger')) {
					var trigger = alarm.getFirstProperty('trigger');
					var related = trigger.getParameter('related');
					if (related) {
						alarmData.trigger.related = related;
					} else {
						alarmData.trigger.related = 'start';
					}
				}

				data.alarms.push(alarmData);
			}
		},
		attendee: function(data, vevent) {
			simpleParser._createArray(data, 'attendees');

			var attendees = vevent.getAllProperties('attendee');
			var id;
			for (id in attendees) {
				var attendee = attendees[id];
				data.attendees.push({
					id: id,
					type: attendee.type,
					value: attendee.getFirstValue(),
					props: {
						role: attendee.getParameter('role'),
						rvsp: attendee.getParameter('rvsp'),
						partstat: attendee.getParameter('partstat'),
						cutype: attendee.getParameter('cutype'),
						sentmail: attendee.getParameter('x-oc-sentmail')
					}
				});
			}
		},
		categories: function(data, vevent) {
			simpleParser._createArray(data, 'categories');

			var categories = vevent.getAllProperties('categories');
			var id = 0;
			var group = 0;
/*			for (var category in categories) {
				var values = category.getValues();
				for (var value in values) {
					data.attendees.push({
						id: id,
						group: group,
						type: category.type,
						value: value
					});
					id++;
				}
				id = 0;
				group++;
			}*/
		},
		date: function(data, vevent) {
			var dtstart = vevent.getFirstPropertyValue('dtstart');
			var dtend;

			if (vevent.hasProperty('dtend')) {
				dtend = vevent.getFirstPropertyValue('dtend');
			} else if (vevent.hasProperty('duration')) {
				dtend = dtstart.clone();
				dtend.addDuration(vevent.getFirstPropertyValue('dtstart'));
			} else {
				dtend = dtstart.clone();
			}

			data.start = {
				type: dtstart.icaltype,
				value: dtstart.toJSDate
			};
			data.startzone = {
				type: 'string',
				value: dtstart.zone
			};
			data.end = {
				type: dtend.icaltype,
				value: dtend.toJSDate
			};
			data.endzone = {
				type: 'string',
				value: dtend.zone
			};
			data.allDay = (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
		},
		geo: function(data, vevent) {
			/*
			ICAL.js issue here - need to report bug or even better send a pr
			var value = vevent.getFirstPropertyValue('geo');
			var parts = value.split(';');

			data.geo = {
				lat: parts[0],
				long: parts[1]
			};*/
		},
		repeating: function(data, vevent) {
			var iCalEvent = new ICAL.Event(vevent);

			data.repeating = iCalEvent.isRecurring();
			simpleParser.date(data, vevent, true, 'rdate', 'rdate');
			simpleParser.string(data, vevent, true, 'rrule', 'rrule');

			simpleParser.date(data, vevent, true, 'exdate', 'exdate');
			simpleParser.string(data, vevent, true, 'exrule', 'exrule');
		}
	};

	//public functions
	/**
	 * parse and expand jCal data to simple structure
	 * @param vevent object to be parsed
	 * @returns {{}}
	 */
	var parse = function(vevent) {
		var data = {};

		for (var parser in specificParser) {
			if (!specificParser.hasOwnProperty(parser)) {
				continue;
			}

			specificParser[parser](data, vevent);
		}

		for (var key in simpleProperties) {
			if (!simpleProperties.hasOwnProperty(key)) {
				continue;
			}

			var prop = simpleProperties[key];
			if (vevent.hasProperty(prop.jName)) {
				prop.parser(data, vevent, prop.multiple, key, prop.jName);
			}
		}

		return data;
	};


	/**
	 * patch vevent with data from event editor
	 * @param vevent object to update
	 * @param data patched data
	 * @returns {*}
	 */
	var patch = function(vevent, data) {
		//TO BE IMPLEMENTED
	};

	return {
		parse: parse,
		patch: patch
	};
});

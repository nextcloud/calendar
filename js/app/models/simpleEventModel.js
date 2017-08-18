/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

app.factory('SimpleEvent', function () {
	'use strict';

	const defaults = {
		'summary': null,
		'location': null,
		'organizer': null,
		'class': null,
		'description': null,
		'url': null,
		'status': null,
		//'resources': null,
		'alarm': null,
		'attendee': null,
		//'categories': null,
		'dtstart': null,
		'dtend': null,
		'repeating': null,
		'rdate': null,
		'rrule': null,
		'exdate': null
	};

	const attendeeParameters = [
		'role',
		'spreedmeetingrole',
		'rsvp',
		'partstat',
		'cutype',
		'cn',
		'delegated-from',
		'delegated-to'
	];

	const organizerParameters = [
		'cn'
	];

	function getDtProperty(simple, propName) {
		if (simple.allDay) {
			simple[propName].parameters.zone = 'floating';
		}

		simple[propName].parameters.zone = simple[propName].parameters.zone || 'floating';

		if (simple[propName].parameters.zone !== 'floating' && !ICAL.TimezoneService.has(simple[propName].parameters.zone)) {
			throw new Error('Requested timezone not found (' + simple[propName].parameters.zone + ')');
		}

		const iCalTime = ICAL.Time.fromJSDate(simple[propName].value.toDate(), false);
		iCalTime.isDate = simple.allDay;

		if (simple[propName].parameters.zone !== 'floating') {
			iCalTime.zone = ICAL.TimezoneService.get(simple[propName].parameters.zone);
		}

		return iCalTime;
	}

	/**
	 * parsers of supported properties
	 */
	const simpleParser = {
		date: function (data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseSingle(data, vevent, key, parameters, function (p) {
				const first = p.getFirstValue();
				return (p.type === 'duration') ? first.toSeconds() : moment(first.toJSDate());
			});
		},
		dates: function (data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseMultiple(data, vevent, key, parameters, function (p) {
				const values = p.getValues(), usableValues = [];

				values.forEach(function (value) {
					if (p.type === 'duration') {
						usableValues.push(value.toSeconds());
					} else {
						usableValues.push(moment(value.toJSDate()));
					}
				});

				return usableValues;
			});
		},
		string: function (data, vevent, key, parameters) {
			simpleParser._parseSingle(data, vevent, key, parameters, function (p) {
				return p.isMultiValue ? p.getValues() : p.getFirstValue();
			});
		},
		strings: function (data, vevent, key, parameters) {
			simpleParser._parseMultiple(data, vevent, key, parameters, function (p) {
				return p.isMultiValue ? p.getValues() : p.getFirstValue();
			});
		},
		_parseSingle: function (data, vevent, key, parameters, valueParser) {
			const prop = vevent.getFirstProperty(key);
			if (!prop) {
				return;
			}

			data[key] = {
				parameters: simpleParser._parseParameters(prop, parameters),
				type: prop.type
			};

			if (prop.isMultiValue) {
				data[key].values = valueParser(prop);
			} else {
				data[key].value = valueParser(prop);
			}
		},
		_parseMultiple: function (data, vevent, key, parameters, valueParser) {
			data[key] = data[key] || [];

			const properties = vevent.getAllProperties(key);
			let group = 0;

			properties.forEach(function (property) {
				const currentElement = {
					group: group,
					parameters: simpleParser._parseParameters(property, parameters),
					type: property.type
				};

				if (property.isMultiValue) {
					currentElement.values = valueParser(property);
				} else {
					currentElement.value = valueParser(property);
				}

				data[key].push(currentElement);
				property.setParameter('x-nc-group-id', group.toString());
				group++;
			});
		},
		_parseParameters: function (prop, para) {
			const parameters = {};

			if (!para) {
				return parameters;
			}

			para.forEach(function (p) {
				parameters[p] = prop.getParameter(p);
			});

			return parameters;
		}
	};

	const simpleReader = {
		date: function (vevent, oldSimpleData, newSimpleData, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleReader._readSingle(vevent, oldSimpleData, newSimpleData, key, parameters, function (v, isMultiValue) {
				return (v.type === 'duration') ? ICAL.Duration.fromSeconds(v.value) : ICAL.Time.fromJSDate(v.value.toDate());
			});
		},
		dates: function (vevent, oldSimpleData, newSimpleData, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleReader._readMultiple(vevent, oldSimpleData, newSimpleData, key, parameters, function (v, isMultiValue) {
				const values = [];

				v.values.forEach(function (value) {
					if (v.type === 'duration') {
						values.push(ICAL.Duration.fromSeconds(value));
					} else {
						values.push(ICAL.Time.fromJSDate(value.toDate()));
					}
				});

				return values;
			});
		},
		string: function (vevent, oldSimpleData, newSimpleData, key, parameters) {
			simpleReader._readSingle(vevent, oldSimpleData, newSimpleData, key, parameters, function (v, isMultiValue) {
				return isMultiValue ? v.values : v.value;
			});
		},
		strings: function (vevent, oldSimpleData, newSimpleData, key, parameters) {
			simpleReader._readMultiple(vevent, oldSimpleData, newSimpleData, key, parameters, function (v, isMultiValue) {
				return isMultiValue ? v.values : v.value;
			});
		},
		_readSingle: function (vevent, oldSimpleData, newSimpleData, key, parameters, valueReader) {
			if (!newSimpleData[key]) {
				return;
			}
			if (!newSimpleData[key].hasOwnProperty('value') && !newSimpleData[key].hasOwnProperty('values')) {
				return;
			}
			const isMultiValue = newSimpleData[key].hasOwnProperty('values');

			const prop = vevent.updatePropertyWithValue(key, valueReader(newSimpleData[key], isMultiValue));
			simpleReader._readParameters(prop, newSimpleData[key], parameters);
		},
		_readMultiple: function (vevent, oldSimpleData, newSimpleData, key, parameters, valueReader) {
			const oldGroups = [];
			let properties, pKey, groupId;

			oldSimpleData[key] = oldSimpleData[key] || [];
			oldSimpleData[key].forEach(function (e) {
				oldGroups.push(e.group);
			});

			newSimpleData[key] = newSimpleData[key] || [];
			newSimpleData[key].forEach(function (e) {
				const isMultiValue = e.hasOwnProperty('values');
				const value = valueReader(e, isMultiValue);

				if (oldGroups.indexOf(e.group) === -1) {
					const property = new ICAL.Property(key);
					simpleReader._setProperty(property, value, isMultiValue);
					simpleReader._readParameters(property, e, parameters);
					vevent.addProperty(property);
				} else {
					oldGroups.splice(oldGroups.indexOf(e.group), 1);

					properties = vevent.getAllProperties(key);
					for (pKey in properties) {
						if (!properties.hasOwnProperty(pKey)) {
							continue;
						}

						groupId = properties[pKey].getParameter('x-nc-group-id');
						if (groupId === null) {
							continue;
						}
						if (parseInt(groupId) === e.group) {
							simpleReader._setProperty(properties[pKey], value, isMultiValue);
							simpleReader._readParameters(properties[pKey], e, parameters);
						}
					}
				}
			});

			properties = vevent.getAllProperties(key);
			properties.forEach(function (property) {
				groupId = property.getParameter('x-nc-group-id');
				if (oldGroups.indexOf(parseInt(groupId)) !== -1) {
					vevent.removeProperty(property);
				}
				property.removeParameter('x-nc-group-id');
			});
		},
		_readParameters: function (prop, simple, para) {
			if (!para) {
				return;
			}
			if (!simple.parameters) {
				return;
			}

			para.forEach(function (p) {
				if (simple.parameters[p]) {
					prop.setParameter(p, simple.parameters[p]);
				} else {
					prop.removeParameter(p);
				}
			});
		},
		_setProperty: function (prop, value, isMultiValue) {
			if (isMultiValue) {
				prop.setValues(value);
			} else {
				prop.setValue(value);
			}
		}
	};

	/**
	 * properties supported by event editor
	 */
	const simpleProperties = {
		//General
		'summary': {parser: simpleParser.string, reader: simpleReader.string},
		'location': {parser: simpleParser.string, reader: simpleReader.string},
		//'categories': {parser: simpleParser.strings, reader: simpleReader.strings},
		//attendees
		'attendee': {
			parser: simpleParser.strings,
			reader: simpleReader.strings,
			parameters: attendeeParameters
		},
		'organizer': {
			parser: simpleParser.string,
			reader: simpleReader.string,
			parameters: organizerParameters
		},
		//sharing
		'class': {parser: simpleParser.string, reader: simpleReader.string},
		//other
		'description': {
			parser: simpleParser.string,
			reader: simpleReader.string
		},
		'url': {parser: simpleParser.string, reader: simpleReader.string},
		'status': {parser: simpleParser.string, reader: simpleReader.string}
		//'resources': {parser: simpleParser.strings, reader: simpleReader.strings}
	};

	/**
	 * specific parsers that check only one property
	 */
	const specificParser = {
		alarm: function (data, vevent) {
			data.alarm = data.alarm || [];

			const alarms = vevent.getAllSubcomponents('valarm');
			let group = 0;
			alarms.forEach(function (alarm) {
				const alarmData = {
					group: group,
					action: {},
					trigger: {},
					repeat: {},
					duration: {},
					attendee: []
				};

				simpleParser.string(alarmData, alarm, 'action');
				simpleParser.date(alarmData, alarm, 'trigger');
				simpleParser.string(alarmData, alarm, 'repeat');
				simpleParser.date(alarmData, alarm, 'duration');
				simpleParser.strings(alarmData, alarm, 'attendee', attendeeParameters);

				//alarmData.attendeeCopy = [];
				//angular.copy(alarmData.attendee, alarmData.attendeeCopy);

				if (alarmData.trigger.type === 'duration' && alarm.hasProperty('trigger')) {
					const trigger = alarm.getFirstProperty('trigger');
					const related = trigger.getParameter('related');
					if (related) {
						alarmData.trigger.related = related;
					} else {
						alarmData.trigger.related = 'start';
					}
				}

				data.alarm.push(alarmData);

				alarm.getFirstProperty('action')
					.setParameter('x-nc-group-id', group.toString());
				group++;
			});
		},
		date: function (data, vevent) {
			const dtstart = vevent.getFirstPropertyValue('dtstart');
			let dtend;

			if (vevent.hasProperty('dtend')) {
				dtend = vevent.getFirstPropertyValue('dtend');
			} else if (vevent.hasProperty('duration')) {
				dtend = dtstart.clone();
				dtend.addDuration(vevent.getFirstPropertyValue('duration'));
			} else {
				dtend = dtstart.clone();
			}

			data.dtstart = {
				parameters: {
					zone: dtstart.zone.toString()
				},
				value: moment({
					years: dtstart.year,
					months: dtstart.month - 1,
					date: dtstart.day,
					hours: dtstart.hour,
					minutes: dtstart.minute,
					seconds: dtstart.seconds
				})
			};
			data.dtend = {
				parameters: {
					zone: dtend.zone.toString()
				},
				value: moment({
					years: dtend.year,
					months: dtend.month - 1,
					date: dtend.day,
					hours: dtend.hour,
					minutes: dtend.minute,
					seconds: dtend.seconds
				})
			};
			data.allDay = (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
		},
		repeating: function (data, vevent) {
			const iCalEvent = new ICAL.Event(vevent);

			data.repeating = iCalEvent.isRecurring();

			const rrule = vevent.getFirstPropertyValue('rrule');
			if (rrule) {
				data.rrule = {
					count: rrule.count,
					freq: rrule.freq,
					interval: rrule.interval,
					parameters: rrule.parts,
					until: null
				};

				/*if (rrule.until) {
				 simpleParser.date(data.rrule, rrule, 'until');
				 }*/
			} else {
				data.rrule = {
					freq: 'NONE'
				};
			}
		}
	};

	const specificReader = {
		alarm: function (vevent, oldSimpleData, newSimpleData) {
			const components = {}, key = 'alarm';

			function getAlarmGroup (alarmData) {
				return alarmData.group;
			}

			oldSimpleData[key] = oldSimpleData[key] || [];
			const oldGroups = oldSimpleData[key].map(getAlarmGroup);

			newSimpleData[key] = newSimpleData[key] || [];
			const newGroups = newSimpleData[key].map(getAlarmGroup);

			//check for any alarms that are in the old data,
			//but have been removed from the new data
			const removedAlarms = oldGroups.filter(function (group) {
				return (newGroups.indexOf(group) === -1);
			});

			//get all of the valarms and save them in an object keyed by their groupId
			vevent.getAllSubcomponents('valarm').forEach(function (alarm) {
				const group = alarm.getFirstProperty('action').getParameter('x-nc-group-id');
				components[group] = alarm;
			});

			//remove any valarm subcomponents have a groupId that matches one of the removedAlarms
			removedAlarms.forEach(function (group) {
				if (components[group]) {
					vevent.removeSubcomponent(components[group]);
					delete components[group];
				}
			});

			//update and create valarms using the new alarm data
			newSimpleData[key].forEach(function (alarmData) {
				let valarm, oldSimpleAlarmData;

				if (oldGroups.indexOf(alarmData.group) === -1) {
					valarm = new ICAL.Component('VALARM');
					vevent.addSubcomponent(valarm);
					oldSimpleAlarmData = {};
				} else {
					valarm = components[alarmData.group];
					oldSimpleAlarmData = oldSimpleData.alarm.find(function(alarm) {
						return alarm.group === alarmData.group;
					});
				}

				simpleReader.string(valarm, oldSimpleAlarmData, alarmData, 'action', []);
				simpleReader.date(valarm, oldSimpleAlarmData, alarmData, 'trigger', []);
				simpleReader.string(valarm, oldSimpleAlarmData, alarmData, 'repeat', []);
				simpleReader.date(valarm, oldSimpleAlarmData, alarmData, 'duration', []);
				simpleReader.strings(valarm, oldSimpleAlarmData, alarmData, 'attendee', attendeeParameters);

				valarm.getFirstProperty('action').removeParameter('x-nc-group-id');
			});
		},
		date: function (vevent, oldSimpleData, newSimpleData) {
			vevent.removeAllProperties('dtstart');
			vevent.removeAllProperties('dtend');
			vevent.removeAllProperties('duration');

			// remove tzid property from allday events
			if (newSimpleData.allDay) {
				newSimpleData.dtstart.parameters.zone = 'floating';
				newSimpleData.dtend.parameters.zone = 'floating';
			}

			newSimpleData.dtstart.parameters.zone = newSimpleData.dtstart.parameters.zone || 'floating';
			newSimpleData.dtend.parameters.zone = newSimpleData.dtend.parameters.zone || 'floating';

			if (newSimpleData.dtstart.parameters.zone !== 'floating' && !ICAL.TimezoneService.has(newSimpleData.dtstart.parameters.zone)) {
				throw new Error('Requested timezone not found (' + newSimpleData.dtstart.parameters.zone + ')');
			}
			if (newSimpleData.dtend.parameters.zone !== 'floating' && !ICAL.TimezoneService.has(newSimpleData.dtend.parameters.zone)) {
				throw new Error('Requested timezone not found (' + newSimpleData.dtend.parameters.zone + ')');
			}

			const start = ICAL.Time.fromJSDate(newSimpleData.dtstart.value.toDate(), false);
			start.isDate = newSimpleData.allDay;
			const end = ICAL.Time.fromJSDate(newSimpleData.dtend.value.toDate(), false);
			end.isDate = newSimpleData.allDay;

			const alreadyStoredTimezones = ['UTC'];
			const vtimezones = vevent.parent.getAllSubcomponents('vtimezone');
			vtimezones.forEach(function (vtimezone) {
				alreadyStoredTimezones.push(vtimezone.getFirstPropertyValue('tzid'));
			});

			const startProp = new ICAL.Property('dtstart', vevent);
			if (newSimpleData.dtstart.parameters.zone !== 'floating') {
				if (newSimpleData.dtstart.parameters.zone !== 'UTC') {
					startProp.setParameter('tzid', newSimpleData.dtstart.parameters.zone);
				}

				const startTz = ICAL.TimezoneService.get(newSimpleData.dtstart.parameters.zone);
				start.zone = startTz;
				if (alreadyStoredTimezones.indexOf(newSimpleData.dtstart.parameters.zone) === -1) {
					vevent.parent.addSubcomponent(startTz.component);
					alreadyStoredTimezones.push(newSimpleData.dtstart.parameters.zone);
				}
			}
			startProp.setValue(start);

			const endProp = new ICAL.Property('dtend', vevent);
			if (newSimpleData.dtend.parameters.zone !== 'floating') {
				if (newSimpleData.dtend.parameters.zone !== 'UTC') {
					endProp.setParameter('tzid', newSimpleData.dtend.parameters.zone);
				}

				const endTz = ICAL.TimezoneService.get(newSimpleData.dtend.parameters.zone);
				end.zone = endTz;
				if (alreadyStoredTimezones.indexOf(newSimpleData.dtend.parameters.zone) === -1) {
					vevent.parent.addSubcomponent(endTz.component);
				}
			}
			endProp.setValue(end);

			vevent.addProperty(startProp);
			vevent.addProperty(endProp);
		},
		repeating: function (vevent, oldSimpleData, newSimpleData) {
			// We won't support exrule, because it's deprecated and barely used in the wild
			if (newSimpleData.rrule === null || newSimpleData.rrule.freq === 'NONE') {
				vevent.removeAllProperties('rdate');
				vevent.removeAllProperties('rrule');
				vevent.removeAllProperties('exdate');

				return;
			}

			if (newSimpleData.rrule.dontTouch) {
				return;
			}

			const params = {
				interval: newSimpleData.rrule.interval,
				freq: newSimpleData.rrule.freq
			};

			if (newSimpleData.rrule.count) {
				params.count = newSimpleData.rrule.count;
			}

			const rrule = new ICAL.Recur(params);
			vevent.updatePropertyWithValue('rrule', rrule);
		}
	};

	function SimpleEvent (event) {
		const context = {
			event,
			patched: false,
			oldProperties: {}
		};

		const iface = {
			_isASimpleEventObject: true,
		};
		angular.extend(iface, defaults);

		context.generateOldProperties = function () {
			context.oldProperties = {};

			for (let key in defaults) {
				context.oldProperties[key] = angular.copy(iface[key]);
			}
		};

		iface.checkDtStartBeforeDtEnd = function() {
			const dtStart = getDtProperty(iface, 'dtstart');
			const dtEnd = getDtProperty(iface, 'dtend');

			// dtend may be at the same time or later, but not before
			return (dtEnd.compare(dtStart) !== -1);
		};

		iface.patch = function() {
			if (context.patched) {
				throw new Error('SimpleEvent was already patched, patching not possible');
			}

			for (let simpleKey in simpleProperties) {
				const simpleProperty = simpleProperties[simpleKey];

				const reader = simpleProperty.reader;
				const parameters = simpleProperty.parameters;
				if (context.oldProperties[simpleKey] !== iface[simpleKey]) {
					if (iface[simpleKey] === null) {
						context.event.removeAllProperties(simpleKey);
					} else {
						reader(context.event, context.oldProperties, iface, simpleKey, parameters);
					}
				}
			}

			for (let specificKey in specificReader) {
				const reader = specificReader[specificKey];
				reader(context.event, context.oldProperties, iface);
			}

			context.patched = true;
		};

		for (let simpleKey in simpleProperties) {
			const simpleProperty = simpleProperties[simpleKey];

			const parser = simpleProperty.parser;
			const parameters = simpleProperty.parameters;
			if (context.event.hasProperty(simpleKey)) {
				parser(iface, context.event, simpleKey, parameters);
			}
		}

		for (let specificKey in specificParser) {
			const parser = specificParser[specificKey];
			parser(iface, context.event);
		}

		context.generateOldProperties();

		return iface;
	}

	SimpleEvent.isSimpleEvent = function (obj) {
		return (typeof obj === 'object' && obj !== null && obj._isASimpleEventObject === true);
	};

	return SimpleEvent;
});

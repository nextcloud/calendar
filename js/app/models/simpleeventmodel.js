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

app.factory('SimpleEvent', function() {
	'use strict';

	/**
	 * structure of simple data
	 */
	var defaults = {
		'summary': null,
		'location': null,
		//'created': null,
		//'last-modified': null,
		'organizer': null,
		'class': null,
		'description': null,
		//'url': null,
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

	var attendeeParameters = [
		'role',
		'rvsp',
		'partstat',
		'cutype',
		'cn',
		'delegated-from',
		'delegated-to'
	];

	var organizerParameters = [
		'cn'
	];

	/**
	 * parsers of supported properties
	 */
	var simpleParser = {
		date: function(data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseSingle(data, vevent, key, parameters, function(p) {
				return (p.type === 'duration') ?
					p.getFirstValue().toSeconds():
					moment(p.getFirstValue().toJSDate());
			});
		},
		dates: function(data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseMultiple(data, vevent, key, parameters, function(p) {
				var values = p.getValues(),
					usableValues = [];
				for (var vKey in values) {
					if (!values.hasOwnProperty(vKey)) {
						continue;
					}

					usableValues.push(
						(p.type === 'duration') ?
							values[vKey].toSeconds():
							moment(values[vKey].toJSDate())
					);
				}

				return usableValues;
			});
		},
		string: function(data, vevent, key, parameters) {
			simpleParser._parseSingle(data, vevent, key, parameters, function(p) {
				return p.isMultiValue ? p.getValues() : p.getFirstValue();
			});
		},
		strings: function(data, vevent, key, parameters) {
			simpleParser._parseMultiple(data, vevent, key, parameters, function(p) {
				return p.isMultiValue ? p.getValues() : p.getFirstValue();
			});
		},
		_parseSingle: function(data, vevent, key, parameters, valueParser) {
			var prop = vevent.getFirstProperty(key);
			if (!prop) {
				return;
			}

			data[key] = {
				parameters: simpleParser._parseParameters(prop, parameters),
				type: prop.type
			};

			if (prop.isMultiValue) {
				angular.extend(data[key], {
					values: valueParser(prop)
				});
			} else {
				angular.extend(data[key], {
					value: valueParser(prop)
				});
			}
		},
		_parseMultiple: function(data, vevent, key, parameters, valueParser) {
			data[key] = data[key] || [];

			var properties = vevent.getAllProperties(key),
				group = 0;

			for (var pKey in properties) {
				if (!properties.hasOwnProperty(pKey)) {
					continue;
				}

				var currentElement = {
					group: group,
					parameters: simpleParser._parseParameters(properties[pKey], parameters),
					type: properties[pKey].type
				};

				if (properties[pKey].isMultiValue) {
					angular.extend(currentElement, {
						values: valueParser(properties[pKey])
					});
				} else {
					angular.extend(currentElement, {
						value: valueParser(properties[pKey])
					});
				}

				data[key].push(currentElement);
				properties[pKey].setParameter('x-oc-group-id', group.toString());
				group++;
			}
		},
		_parseParameters: function(prop, para) {
			var parameters = {};

			if (!para) {
				return parameters;
			}

			for (var i=0,l=para.length; i < l; i++) {
				parameters[para[i]] = prop.getParameter(para[i]);
			}

			return parameters;
		}
	};

	var simpleReader = {
		date: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleReader._readSingle(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				if (v.type === 'duration') {
					return ICAL.Duration.fromSeconds(v.value);
				} else {
					return ICAL.Time.fromJSDate(v.value.toDate());
				}
			});
		},
		dates: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleReader._readMultiple(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				var values = [];

				for (var i=0, length=v.values.length; i < length; i++) {
					if (v.type === 'duration') {
						values.push(ICAL.Duration.fromSeconds(v.values[i]));
					} else {
						values.push(ICAL.Time.fromJSDate(v.values[i].toDate()));
					}
				}

				return values;
			});
		},
		string: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			simpleReader._readSingle(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				return isMultiValue ? v.values : v.value;
			});
		},
		strings: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			simpleReader._readMultiple(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				return isMultiValue ? v.values : v.value;
			});
		},
		_readSingle: function(vevent, oldSimpleData, newSimpleData, key, parameters, valueReader) {
			if (!newSimpleData[key]) {
				return;
			}
			if (!newSimpleData[key].hasOwnProperty('value') && !newSimpleData[key].hasOwnProperty('values')) {
				return;
			}
			var isMultiValue = newSimpleData[key].hasOwnProperty('values');

			var prop = vevent.updatePropertyWithValue(key, valueReader(newSimpleData[key], isMultiValue));
			simpleReader._readParameters(prop, newSimpleData[key], parameters);
		},
		_readMultiple: function(vevent, oldSimpleData, newSimpleData, key, parameters, valueReader) {
			var oldGroups=[], properties=null, pKey=null, groupId;

			oldSimpleData[key] = oldSimpleData[key] || [];
			for (var i=0, oldLength=oldSimpleData[key].length; i < oldLength; i++) {
				oldGroups.push(oldSimpleData[key][i].group);
			}

			newSimpleData[key] = newSimpleData[key] || [];
			for (var j=0, newLength=newSimpleData[key].length; j < newLength; j++) {
				var isMultiValue = newSimpleData[key][j].hasOwnProperty('values');
				var value = valueReader(newSimpleData[key][j], isMultiValue);

				if (oldGroups.indexOf(newSimpleData[key][j].group) === -1) {
					var property = new ICAL.Property(key);
					simpleReader._setProperty(property, value, isMultiValue);
					simpleReader._readParameters(property, newSimpleData[key][j], parameters);
					vevent.addProperty(property);
				} else {
					oldGroups.splice(oldGroups.indexOf(newSimpleData[key][j].group), 1);

					properties = vevent.getAllProperties(key);
					for (pKey in properties) {
						if (!properties.hasOwnProperty(pKey)) {
							continue;
						}

						groupId = properties[pKey].getParameter('x-oc-group-id');
						if (groupId === null) {
							continue;
						}
						if (parseInt(groupId) === newSimpleData[key][j].group) {
							simpleReader._setProperty(properties[pKey], value, isMultiValue);
							simpleReader._readParameters(properties[pKey], newSimpleData[key][j], parameters);
						}
					}
				}
			}

			properties = vevent.getAllProperties(key);
			for (pKey in properties) {
				if (!properties.hasOwnProperty(pKey)) {
					continue;
				}

				groupId = properties[pKey].getParameter('x-oc-group-id');
				if (oldGroups.indexOf(parseInt(groupId)) !== -1) {
					vevent.removeProperty(properties[pKey]);
				}
			}
		},
		_readParameters: function(prop, simple, para) {
			if (!para) {
				return;
			}
			if (!simple.parameters) {
				return;
			}

			for (var i=0,l=para.length; i < l; i++) {
				if (simple.parameters[para[i]]) {
					prop.setParameter(para[i], simple.parameters[para[i]]);
				} else {
					prop.removeParameter(simple.parameters[para[i]]);
				}
			}
		},
		_setProperty: function(prop, value, isMultiValue) {
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
	var simpleProperties = {
		//General
		'summary': {parser: simpleParser.string, reader: simpleReader.string},
		'location': {parser: simpleParser.string, reader: simpleReader.string},
		//'created': {parser: simpleParser.date, reader: simpleReader.date},
		//'last-modified': {parser: simpleParser.date, reader: simpleReader.date},
		//'categories': {parser: simpleParser.strings, reader: simpleReader.strings},
		//attendees
		'attendee': {parser: simpleParser.strings, reader: simpleReader.strings, parameters: attendeeParameters},
		'organizer': {parser: simpleParser.string, reader: simpleReader.string, parameters: organizerParameters},
		//sharing
		'class': {parser: simpleParser.string, reader: simpleReader.string},
		//other
		'description': {parser: simpleParser.string, reader: simpleReader.string},
		//'url': {parser: simpleParser.string, reader: simpleReader.string},
		'status': {parser: simpleParser.string, reader: simpleReader.string}
		//'resources': {parser: simpleParser.strings, reader: simpleReader.strings}
	};

	/**
	 * specific parsers that check only one property
	 */
	var specificParser = {
		alarm: function(data, vevent) {
			data.alarm = data.alarm || [];

			var alarms = vevent.getAllSubcomponents('valarm'),
				group = 0;
			for (var key in alarms) {
				if (!alarms.hasOwnProperty(key)) {
					continue;
				}

				var alarm = alarms[key];
				var alarmData = {
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
				simpleParser.string(alarmData, alarm, 'duration');
				//simpleParser.strings(alarmData, alarm, 'attendee', attendeeParameters);

				if (alarmData.trigger.type === 'duration' && alarm.hasProperty('trigger')) {
					var trigger = alarm.getFirstProperty('trigger');
					var related = trigger.getParameter('related');
					if (related) {
						alarmData.trigger.related = related;
					} else {
						alarmData.trigger.related = 'start';
					}
				}

				data.alarm.push(alarmData);

				alarm.getFirstProperty('action')
					.setParameter('x-oc-group-id', group.toString());
				group++;
			}
		},
		date: function(data, vevent) {
			var dtstart = vevent.getFirstPropertyValue('dtstart'), dtend;
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
				type: dtstart.icaltype,
				value: moment({years: dtstart.year, months: dtstart.month - 1, date: dtstart.day,
					hours: dtstart.hour, minutes: dtstart.minute, seconds: dtstart.seconds})
			};
			data.dtend = {
				parameters: {
					zone: dtend.zone.toString()
				},
				type: dtend.icaltype,
				value: moment({years: dtend.year, months: dtend.month - 1, date: dtend.day,
					hours: dtend.hour, minutes: dtend.minute, seconds: dtend.seconds})
			};
			data.allDay = (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
		},
		repeating: function(data, vevent) {
			var iCalEvent = new ICAL.Event(vevent);

			data.repeating = iCalEvent.isRecurring();

			var rrule = vevent.getFirstPropertyValue('rrule');
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

	var specificReader = {
		alarm: function(vevent, oldSimpleData, newSimpleData) {
			var oldGroups, newGroups, valarm, removedAlarms, components={}, key='alarm';

			function getAlarmGroup(alarmData) {
				return alarmData.group;
			}

			oldSimpleData[key] = oldSimpleData[key] || [];
			oldGroups = oldSimpleData[key].map(getAlarmGroup);
			
			newSimpleData[key] = newSimpleData[key] || [];
			newGroups = newSimpleData[key].map(getAlarmGroup);
			
			//check for any alarms that are in the old data,
			//but have been removed from the new data
			removedAlarms = oldGroups.filter(function(group) {
				return (newGroups.indexOf(group) === -1);
			});

			//get all of the valarms and save them in an object keyed by their groupId
			angular.forEach(vevent.getAllSubcomponents('valarm'), function(component) {
				var group = component.getFirstProperty('action').getParameter('x-oc-group-id');
				components[group] = component;
			});

			//remove any valarm subcomponents have a groupId that matches one of the removedAlarms
			angular.forEach(removedAlarms, function(group){
				if (components[group]) {
					vevent.removeSubcomponent(components[group]);
					delete components[group];
				}
			});

			//update and create valarms using the new alarm data
			angular.forEach(newSimpleData[key], function(alarmData) {
				if (oldGroups.indexOf(alarmData.group) === -1) {
					valarm = new ICAL.Component('VALARM');
					vevent.addSubcomponent(valarm);
				} else {
					valarm = components[alarmData.group];
				}
				
				simpleReader.string(valarm, {}, alarmData, 'action', []);
				simpleReader.date(valarm, {}, alarmData, 'trigger', []);
				simpleReader.string(valarm, {}, alarmData, 'repeat', []);
				simpleReader.string(valarm, {}, alarmData, 'duration', []);
				simpleReader.strings(valarm, {}, alarmData, 'attendee', attendeeParameters);
			});
		},
		date: function(vevent, oldSimpleData, newSimpleData) {
			vevent.removeAllProperties('dtstart');
			vevent.removeAllProperties('dtend');
			vevent.removeAllProperties('duration');

			newSimpleData.dtstart.parameters.zone = newSimpleData.dtstart.parameters.zone || 'floating';
			newSimpleData.dtend.parameters.zone = newSimpleData.dtend.parameters.zone || 'floating';

			if (newSimpleData.dtstart.parameters.zone !== 'floating' &&
				!ICAL.TimezoneService.has(newSimpleData.dtstart.parameters.zone)) {
				throw {
					kind: 'timezone_missing',
					missing_timezone: newSimpleData.dtstart.parameters.zone
				};
			}
			if (newSimpleData.dtend.parameters.zone !== 'floating' &&
				!ICAL.TimezoneService.has(newSimpleData.dtend.parameters.zone)) {
				throw {
					kind: 'timezone_missing',
					missing_timezone: newSimpleData.dtend.parameters.zone
				};
			}

			var start = ICAL.Time.fromJSDate(newSimpleData.dtstart.value.toDate(), false);
			start.isDate = newSimpleData.allDay;
			var end = ICAL.Time.fromJSDate(newSimpleData.dtend.value.toDate(), false);
			end.isDate = newSimpleData.allDay;

			var availableTimezones = [];
			var vtimezones = vevent.parent.getAllSubcomponents('vtimezone');
			angular.forEach(vtimezones, function(vtimezone) {
				availableTimezones.push(vtimezone.getFirstPropertyValue('tzid'));
			});

			var dtstart = new ICAL.Property('dtstart', vevent);
			dtstart.setValue(start);
			if (newSimpleData.dtstart.parameters.zone !== 'floating') {
				dtstart.setParameter('tzid', newSimpleData.dtstart.parameters.zone);
				var startTz = ICAL.TimezoneService.get(newSimpleData.dtstart.parameters.zone);
				start.zone = startTz;
				if (availableTimezones.indexOf(newSimpleData.dtstart.parameters.zone) === -1) {
					vevent.parent.addSubcomponent(startTz.component);
					availableTimezones.push(newSimpleData.dtstart.parameters.zone);
				}
			}

			var dtend = new ICAL.Property('dtend', vevent);
			dtend.setValue(end);
			if (newSimpleData.dtend.parameters.zone !== 'floating') {
				dtend.setParameter('tzid', newSimpleData.dtend.parameters.zone);
				var endTz = ICAL.TimezoneService.get(newSimpleData.dtend.parameters.zone);
				end.zone = endTz;
				if (availableTimezones.indexOf(newSimpleData.dtend.parameters.zone) === -1) {
					vevent.parent.addSubcomponent(endTz.component);
				}
			}

			vevent.addProperty(dtstart);
			vevent.addProperty(dtend);
		},
		repeating: function(vevent, oldSimpleData, newSimpleData) {
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

			var params = {
				interval: newSimpleData.rrule.interval,
				freq: newSimpleData.rrule.freq
			};

			if (newSimpleData.rrule.count) {
				params.count = newSimpleData.rrule.count;
			}

			var rrule = new ICAL.Recur(params);
			vevent.updatePropertyWithValue('rrule', rrule);
		}
	};

	function SimpleEvent(event) {
		this._event = event;
		angular.extend(this, defaults);

		var parser, parameters;
		for (var key in simpleProperties) {
			if (!simpleProperties.hasOwnProperty(key)) {
				continue;
			}

			parser = simpleProperties[key].parser;
			parameters = simpleProperties[key].parameters;
			if (this._event.hasProperty(key)) {
				parser(this, this._event, key, parameters);
			}
		}

		for (parser in specificParser) {
			if (!specificParser.hasOwnProperty(parser)) {
				continue;
			}

			specificParser[parser](this, this._event);
		}

		this._generateOldProperties();
	}

	SimpleEvent.prototype = {
		_generateOldProperties: function() {
			this._oldProperties = {};

			for (var def in defaults) {
				if (!defaults.hasOwnProperty(def)) {
					continue;
				}

				this._oldProperties[def] = angular.copy(this[def]);
			}
		},
		patch: function() {
			var key, reader, parameters;

			for (key in simpleProperties) {
				if (!simpleProperties.hasOwnProperty(key)) {
					continue;
				}

				reader = simpleProperties[key].reader;
				parameters = simpleProperties[key].parameters;
				if (this._oldProperties[key] !== this[key]) {
					if (this[key] === null) {
						this._event.removeAllProperties(key);
					} else {
						reader(this._event, this._oldProperties, this, key, parameters);
					}
				}
			}

			for (key in specificReader) {
				if (!specificReader.hasOwnProperty(key)) {
					continue;
				}

				reader = specificReader[key];
				reader(this._event, this._oldProperties, this);
			}

			this._generateOldProperties();
		}
	};

	return SimpleEvent;
});

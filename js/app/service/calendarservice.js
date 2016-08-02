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

app.service('CalendarService', function(DavClient, StringUtility, XMLUtility, Calendar, WebCal){
	'use strict';

	var self = this;

	this._CALENDAR_HOME = null;

	this._currentUserPrincipal = null;

	this._takenUrls = [];

	this._PROPERTIES = [
		'{' + DavClient.NS_DAV + '}displayname',
		'{' + DavClient.NS_DAV + '}resourcetype',
		'{' + DavClient.NS_IETF + '}calendar-description',
		'{' + DavClient.NS_IETF + '}calendar-timezone',
		'{' + DavClient.NS_APPLE + '}calendar-order',
		'{' + DavClient.NS_APPLE + '}calendar-color',
		'{' + DavClient.NS_IETF + '}supported-calendar-component-set',
		'{' + DavClient.NS_CALENDARSERVER + '}publish-url',
		'{' + DavClient.NS_CALENDARSERVER + '}pre-publish-url',
		'{' + DavClient.NS_OWNCLOUD + '}calendar-enabled',
		'{' + DavClient.NS_DAV + '}acl',
		'{' + DavClient.NS_DAV + '}owner',
		'{' + DavClient.NS_OWNCLOUD + '}invite',
		'{' + DavClient.NS_CALENDARSERVER + '}source'
	];

	this._xmls = new XMLSerializer();

	function discoverHome(callback) {
		return DavClient.propFind(DavClient.buildUrl(OC.linkToRemoteBase('dav')), ['{' + DavClient.NS_DAV + '}current-user-principal'], 0, {'requesttoken': OC.requestToken}).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw "CalDAV client could not be initialized - Querying current-user-principal failed";
			}

			if (response.body.propStat.length < 1) {
				return;
			}
			var props = response.body.propStat[0].properties;
			self._currentUserPrincipal = props['{' + DavClient.NS_DAV + '}current-user-principal'][0].textContent;

			return DavClient.propFind(DavClient.buildUrl(self._currentUserPrincipal), ['{' + DavClient.NS_IETF + '}calendar-home-set'], 0, {'requesttoken': OC.requestToken}).then(function (response) {
				if (!DavClient.wasRequestSuccessful(response.status)) {
					throw "CalDAV client could not be initialized - Querying calendar-home-set failed";
				}

				if (response.body.propStat.length < 1) {
					return;
				}
				var props = response.body.propStat[0].properties;
				self._CALENDAR_HOME = props['{' + DavClient.NS_IETF + '}calendar-home-set'][0].textContent;

				return callback();
			});
		});
	}

	function getResponseCodeFromHTTPResponse(t) {
		return parseInt(t.split(' ')[1]);
	}

	this.getAll = function() {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.getAll();
			});
		}

		return DavClient.propFind(DavClient.buildUrl(this._CALENDAR_HOME), this._PROPERTIES, 1, {'requesttoken': OC.requestToken}).then(function(response) {
			var calendars = [];

			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw "CalDAV client could not be initialized - Querying calendars failed";
			}

			for (var i = 0; i < response.body.length; i++) {
				var body = response.body[i];
				if (body.propStat.length < 1) {
					continue;
				}

				self._takenUrls.push(body.href);

				var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
				if (!DavClient.wasRequestSuccessful(responseCode)) {
					continue;
				}

				var props = self._getSimplePropertiesFromRequest(body.propStat[0].properties, false);
				if (!props || !props.components.vevent) {
					continue;
				}

				const resourceTypes = body.propStat[0].properties['{' + DavClient.NS_DAV + '}resourcetype'];
				if (!resourceTypes) {
					continue;
				}

				for (var j = 0; j < resourceTypes.length; j++) {
					var name = DavClient.getNodesFullName(resourceTypes[j]);

					if (name === '{' + DavClient.NS_IETF + '}calendar') {
						const calendar = Calendar(body.href, props);
						calendars.push(calendar);
					}
					if (name === '{' + DavClient.NS_CALENDARSERVER + '}subscribed') {
						const webcal = WebCal(body.href, props);
						calendars.push(webcal);
					}
				}
			}

			return calendars;
		});
	};

	this.get = function(url) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.get(url);
			});
		}

		return DavClient.propFind(DavClient.buildUrl(url), this._PROPERTIES, 0, {'requesttoken': OC.requestToken}).then(function(response) {
			var body = response.body;
			if (body.propStat.length < 1) {
				//TODO - something went wrong
				return;
			}

			var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
			if (!DavClient.wasRequestSuccessful(responseCode)) {
				//TODO - something went wrong
				return;
			}

			var props = self._getSimplePropertiesFromRequest(body.propStat[0].properties, false);
			if (!props || !props.components.vevent) {
				return;
			}

			const resourceTypes = body.propStat[0].properties['{' + DavClient.NS_DAV + '}resourcetype'];
			if (!resourceTypes) {
				return;
			}

			for (var j = 0; j < resourceTypes.length; j++) {
				var name = DavClient.getNodesFullName(resourceTypes[j]);

				if (name === '{' + DavClient.NS_IETF + '}calendar') {
					return Calendar(body.href, props);
				}
				if (name === '{' + DavClient.NS_CALENDARSERVER + '}subscribed') {
					return WebCal(body.href, props);
				}
			}
		});
	};

	this.getPubUrl = function(token) {
		const url = OC.linkToRemoteBase('dav') + '/public-calendars/' + token;
		return DavClient.propFind(DavClient.buildUrl(url), this._PROPERTIES, 0, {'requesttoken': OC.requestToken}).then(function(response) {
			var body = response.body;
			if (body.propStat.length < 1) {
				//TODO - something went wrong
				return;
			}
			var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
			if (!DavClient.wasRequestSuccessful(responseCode)) {
				//TODO - something went wrong
				return;
			}
			var props = self._getSimplePropertiesFromRequest(body.propStat[0].properties, true);
			if (!props) {
				return;
			}

			return Calendar(body.href, props);
		});
	};

	this.create = function(name, color, components) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.create(name, color);
			});
		}

		if (typeof components === 'undefined') {
			components = ['vevent', 'vtodo'];
		}

		var xmlDoc = document.implementation.createDocument('', '', null);
		var cMkcalendar = xmlDoc.createElement('d:mkcol');
		cMkcalendar.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cMkcalendar.setAttribute('xmlns:d', 'DAV:');
		cMkcalendar.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cMkcalendar.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cMkcalendar);

		var dSet = xmlDoc.createElement('d:set');
		cMkcalendar.appendChild(dSet);

		var dProp = xmlDoc.createElement('d:prop');
		dSet.appendChild(dProp);

		var dResourceType = xmlDoc.createElement('d:resourcetype');
		dProp.appendChild(dResourceType);

		var dCollection = xmlDoc.createElement('d:collection');
		dResourceType.appendChild(dCollection);

		var cCalendar = xmlDoc.createElement('c:calendar');
		dResourceType.appendChild(cCalendar);

		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'displayname', name));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'enabled', true));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'color', color));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'components', components));

		var body = this._xmls.serializeToString(cMkcalendar);

		var uri = StringUtility.uri(name, (suggestedUri) => self._takenUrls.indexOf(self._CALENDAR_HOME + suggestedUri + '/') === -1);
		var url = this._CALENDAR_HOME + uri + '/';
		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};

		return DavClient.request('MKCOL', url, headers, body).then(function(response) {
			if (response.status === 201) {
				self._takenUrls.push(url);
				return self.get(url).then(function(calendar) {
					calendar.enabled = true;
					return self.update(calendar);
				});
			}
		});
	};

	this.createWebCal = function(name, color, source) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.createWebCal(name, color, source);
			});
		}

		const needsWorkaround = angular.element('#fullcalendar').attr('data-webCalWorkaround') === 'yes';

		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton('d:mkcol', 'd:set', 'd:prop');
		dPropChildren.push({
			name: 'd:resourcetype',
			children: [{
				name: 'd:collection'
			}, {
				name: 'cs:subscribed'
			}]
		});
		dPropChildren.push({
			name: 'd:displayname',
			value: name
		});
		dPropChildren.push({
			name: 'a:calendar-color',
			value: color
		});
		dPropChildren.push({
			name: 'o:calendar-enabled',
			value: '1'
		});
		dPropChildren.push({
			name: 'cs:source',
			children: [{
				name: 'd:href',
				value: source
			}]
		});

		const uri = StringUtility.uri(name, (suggestedUri) => self._takenUrls.indexOf(self._CALENDAR_HOME + suggestedUri + '/') === -1);
		const url = this._CALENDAR_HOME + uri + '/';
		const headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request('MKCOL', url, headers, xml).then(function(response) {
			if (response.status === 201) {
				self._takenUrls.push(url);

				return self.get(url).then(function(webcal) {
					if (needsWorkaround) {
						webcal.enabled = true;
						webcal.displayname = name;
						webcal.color = color;

						return self.update(webcal);
					} else {
						return webcal;
					}
				});
			}
		});
	};

	this.update = function(calendar) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var dPropUpdate = xmlDoc.createElement('d:propertyupdate');
		dPropUpdate.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		dPropUpdate.setAttribute('xmlns:d', 'DAV:');
		dPropUpdate.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		dPropUpdate.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(dPropUpdate);

		var dSet = xmlDoc.createElement('d:set');
		dPropUpdate.appendChild(dSet);

		var dProp = xmlDoc.createElement('d:prop');
		dSet.appendChild(dProp);

		var updatedProperties = calendar.getUpdated();
		if (updatedProperties.length === 0) {
			//nothing to do here
			return calendar;
		}
		for (var i=0; i < updatedProperties.length; i++) {
			dProp.appendChild(this._createXMLForProperty(
				xmlDoc,
				updatedProperties[i],
				calendar[updatedProperties[i]]
			));
		}

		calendar.resetUpdated();

		var url = calendar.url;
		var body = this._xmls.serializeToString(dPropUpdate);
		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};

		return DavClient.request('PROPPATCH', url, headers, body).then(function(response) {
			return calendar;
		});
	};

	this.delete = function(calendar) {
		if (WebCal.isWebCal(calendar)) {
			localStorage.removeItem(calendar.storedUrl);
		}
		return DavClient.request('DELETE', calendar.url, {'requesttoken': OC.requestToken}, '').then(function(response) {
			if (response.status === 204) {
				return true;
			} else {
				// TODO - handle error case
				return false;
			}
		});
	};

	this.share = function(calendar, shareType, shareWith, writable, existingShare) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:share');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(oShare);

		var oSet = xmlDoc.createElement('o:set');
		oShare.appendChild(oSet);

		var dHref = xmlDoc.createElement('d:href');
		if (shareType === OC.Share.SHARE_TYPE_USER) {
			dHref.textContent = 'principal:principals/users/';
		} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
			dHref.textContent = 'principal:principals/groups/';
		}
		dHref.textContent += shareWith;
		oSet.appendChild(dHref);

		var oSummary = xmlDoc.createElement('o:summary');
		oSummary.textContent = t('calendar', '{calendar} shared by {owner}', {
			calendar: calendar.displayname,
			owner: calendar.owner
		});
		oSet.appendChild(oSummary);

		if (writable) {
			var oRW = xmlDoc.createElement('o:read-write');
			oSet.appendChild(oRW);
		}

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = this._xmls.serializeToString(oShare);
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			if (response.status === 200) {
				if (!existingShare) {
					if (shareType === OC.Share.SHARE_TYPE_USER) {
						calendar.shares.users.push({
							id: shareWith,
							displayname: shareWith,
							writable: writable
						});
					} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
						calendar.shares.groups.push({
							id: shareWith,
							displayname: shareWith,
							writable: writable
						});
					}
				}
			}
		});
	};

	this.unshare = function(calendar, shareType, shareWith) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:share');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(oShare);

		var oRemove = xmlDoc.createElement('o:remove');
		oShare.appendChild(oRemove);

		var dHref = xmlDoc.createElement('d:href');
		if (shareType === OC.Share.SHARE_TYPE_USER) {
			dHref.textContent = 'principal:principals/users/';
		} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
			dHref.textContent = 'principal:principals/groups/';
		}
		dHref.textContent += shareWith;
		oRemove.appendChild(dHref);

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = this._xmls.serializeToString(oShare);
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			if (response.status === 200) {
				if (shareType === OC.Share.SHARE_TYPE_USER) {
					calendar.shares.users = calendar.shares.users.filter(function(user) {
						return user.id !== shareWith;
					});
				} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
					calendar.shares.groups = calendar.shares.groups.filter(function(groups) {
						return groups.id !== shareWith;
					});
				}
				//todo - remove entry from calendar object
				return true;
			} else {
				return false;
			}
		});
	};

	this.publish = function(calendar) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:publish-calendar');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://calendarserver.org/ns/');
		xmlDoc.appendChild(oShare);

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = this._xmls.serializeToString(oShare);
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			return response.status === 202;
		});
	};

	this.unpublish = function(calendar) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:unpublish-calendar');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://calendarserver.org/ns/');
		xmlDoc.appendChild(oShare);

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = this._xmls.serializeToString(oShare);
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			return response.status === 200;
		});
	};

	this._createXMLForProperty = function(xmlDoc, propName, value) {
		switch(propName) {
			case 'enabled':
				var oEnabled = xmlDoc.createElement('o:calendar-enabled');
				oEnabled.textContent = value ? '1' : '0';
				return oEnabled;

			case 'displayname':
				var dDisplayname = xmlDoc.createElement('d:displayname');
				dDisplayname.textContent = value;
				return dDisplayname;

			case 'order':
				var aOrder = xmlDoc.createElement('a:calendar-order');
				aOrder.textContent = value;
				return aOrder;

			case 'color':
				var aColor = xmlDoc.createElement('a:calendar-color');
				aColor.textContent = value;
				return aColor;

			case 'components':
				var cComponents = xmlDoc.createElement('c:supported-calendar-component-set');
				for (var i=0; i < value.length; i++) {
					var cComp = xmlDoc.createElement('c:comp');
					cComp.setAttribute('name', value[i].toUpperCase());
					cComponents.appendChild(cComp);
				}
				return cComponents;
		}
	};

	this._getSimplePropertiesFromRequest = function(props, publicMode) {
		if (!props['{' + DavClient.NS_IETF + '}supported-calendar-component-set']) {
			return;
		}

		this._getACLFromResponse(props);

		var simple = {
			displayname: props['{' + DavClient.NS_DAV + '}displayname'],
			color: props['{' + DavClient.NS_APPLE + '}calendar-color'],
			order: props['{' + DavClient.NS_APPLE + '}calendar-order'],
			published: false,
			publishable: false,
			components: {
				vevent: false,
				vjournal: false,
				vtodo: false
			},
			owner: null,
			shareable: publicMode ? false : props.canWrite,
			shares: {
				users: [],
				groups: []
			},
			writable: publicMode ? false : props.canWrite
		};

		if ('{' + DavClient.NS_CALENDARSERVER + '}publish-url' in props) {
			simple.publishurl = props['{' + DavClient.NS_CALENDARSERVER + '}publish-url'][0].textContent;
			simple.published = true;
		}

		if ('{' + DavClient.NS_CALENDARSERVER + '}pre-publish-url' in props) {
			simple.prepublishurl = props['{' + DavClient.NS_CALENDARSERVER + '}pre-publish-url'];
			simple.publishable = true;

			var publicpath = 'public/';
			if (!window.location.toString().endsWith('/')) {
				publicpath = '/public/';
			}
			if (publicMode) {
				simple.publicurl = window.location.toString();
			} else {
				simple.publicurl = window.location.toString() + publicpath + simple.prepublishurl.substr(simple.prepublishurl.lastIndexOf('/') + 1);
			}
		}

		var components = props['{' + DavClient.NS_IETF + '}supported-calendar-component-set'];
		for (var i=0; i < components.length; i++) {
			var name = components[i].attributes.getNamedItem('name').textContent.toLowerCase();
			if (simple.components.hasOwnProperty(name)) {
				simple.components[name] = true;
			}
		}

		var owner = props['{' + DavClient.NS_DAV + '}owner'];
		if (typeof owner !== 'undefined' && owner.length !== 0) {
			owner = owner[0].textContent.slice(0, -1);
			if (owner.indexOf('/remote.php/dav/principals/users/') !== -1) {
				simple.owner = owner.substr(33 + owner.indexOf('/remote.php/dav/principals/users/'));
			}
		}

		var shares = props['{' + DavClient.NS_OWNCLOUD + '}invite'];
		if (typeof shares !== 'undefined') {
			for (var j=0; j < shares.length; j++) {
				var href = shares[j].getElementsByTagNameNS('DAV:', 'href');
				if (href.length === 0) {
					continue;
				}
				href = href[0].textContent;

				var access = shares[j].getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'access');
				if (access.length === 0) {
					continue;
				}
				access = access[0];

				var readWrite = access.getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'read-write');
				readWrite = readWrite.length !== 0;

				if (href.startsWith('principal:principals/users/') && href.substr(27) !== simple.owner) {
					simple.shares.users.push({
						id: href.substr(27),
						displayname: href.substr(27),
						writable: readWrite
					});
				} else if (href.startsWith('principal:principals/groups/')) {
					simple.shares.groups.push({
						id: href.substr(28),
						displayname: href.substr(28),
						writable: readWrite
					});
				}
			}
		}

		if (typeof props['{' + DavClient.NS_OWNCLOUD + '}calendar-enabled'] === 'undefined') {
			if (typeof simple.owner !== 'undefined') {
				simple.enabled = simple.owner === oc_current_user;
			} else {
				simple.enabled = false;
			}
		} else {
			simple.enabled = (props['{' + DavClient.NS_OWNCLOUD + '}calendar-enabled'] === '1');
		}

		if (typeof simple.color !== 'undefined' && simple.color.length !== 0) {
			if (simple.color.length === 9) {
				simple.color = simple.color.substr(0,7);
			}
		} else {
			simple.color = angular.element('#fullcalendar').attr('data-defaultColor');
		}

		simple.writableProperties = (oc_current_user === simple.owner) && simple.writable;

		var source = props['{' + DavClient.NS_CALENDARSERVER + '}source'];
		if (source) {
			for (var k=0; k < source.length; k++) {
				if (DavClient.getNodesFullName(source[k]) === '{' + DavClient.NS_DAV + '}href') {
					simple.href = source[k].textContent;
					simple.writable = false; //this is a webcal calendar
					simple.writableProperties = (oc_current_user === simple.owner);
				}
			}
		}

		return simple;
	};

	this._getACLFromResponse = function(props) {
		var canWrite = false;
		var acl = props['{' + DavClient.NS_DAV + '}acl'];
		if (acl) {
			for (var k=0; k < acl.length; k++) {
				var href = acl[k].getElementsByTagNameNS(DavClient.NS_DAV, 'href');
				if (href.length === 0) {
					continue;
				}
				href = href[0].textContent;
				if (href !== self._currentUserPrincipal) {
					continue;
				}
				var writeNode = acl[k].getElementsByTagNameNS(DavClient.NS_DAV, 'write');
				if (writeNode.length > 0) {
					canWrite = true;
				}
			}
		}
		props.canWrite = canWrite;
	};
});
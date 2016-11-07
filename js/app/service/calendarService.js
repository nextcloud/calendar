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

app.service('CalendarService', function(DavClient, StringUtility, XMLUtility, CalendarFactory, WebCal, isPublic) {
	'use strict';
	
	const context = {
		self: this,
		calendarHome: null,
		userPrincipal: null,
		usedURLs: []
	};

	const PROPERTIES = [
		'{' + DavClient.NS_DAV + '}displayname',
		'{' + DavClient.NS_DAV + '}resourcetype',
		'{' + DavClient.NS_IETF + '}calendar-description',
		'{' + DavClient.NS_IETF + '}calendar-timezone',
		'{' + DavClient.NS_APPLE + '}calendar-order',
		'{' + DavClient.NS_APPLE + '}calendar-color',
		'{' + DavClient.NS_IETF + '}supported-calendar-component-set',
		'{' + DavClient.NS_CALENDARSERVER + '}publish-url',
		'{' + DavClient.NS_CALENDARSERVER + '}allowed-sharing-modes',
		'{' + DavClient.NS_OWNCLOUD + '}calendar-enabled',
		'{' + DavClient.NS_DAV + '}acl',
		'{' + DavClient.NS_DAV + '}owner',
		'{' + DavClient.NS_OWNCLOUD + '}invite',
		'{' + DavClient.NS_CALENDARSERVER + '}source'
	];

	const CALENDAR_IDENTIFIER = '{' + DavClient.NS_IETF + '}calendar';
	const WEBCAL_IDENTIFIER = '{' + DavClient.NS_CALENDARSERVER + '}subscribed';

	const UPDATABLE_PROPERTIES = [
		'color',
		'description',
		'enabled',
		'order'
	];

	const UPDATABLE_PROPERTIES_MAP = {
		color: 'a:calendar-color',
		description: 'd:displayname',
		enabled: 'o:calendar-enabled',
		order: 'a:calendar-order'
	};

	const SHARE_USER = OC.Share.SHARE_TYPE_USER;
	const SHARE_GROUP = OC.Share.SHARE_TYPE_GROUP;

	context.bootPromise = (function() {
		if (isPublic) {
			return Promise.resolve(true);
		}

		const url = DavClient.buildUrl(OC.linkToRemoteBase('dav'));
		const properties = [
			'{' + DavClient.NS_DAV + '}current-user-principal'
		];
		const depth = 0;
		const headers = {
			'requesttoken': OC.requestToken
		};

		return DavClient.propFind(url, properties, depth, headers).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status) || response.body.propStat.length < 1) {
				throw new Error('current-user-principal could not be determined');
			}

			const props = response.body.propStat[0].properties;
			context.userPrincipal = props['{' + DavClient.NS_DAV + '}current-user-principal'][0].textContent;

			const url = context.userPrincipal;
			const properties = [
				'{' + DavClient.NS_IETF + '}calendar-home-set'
			];
			const depth = 0;
			const headers = {
				'requesttoken': OC.requestToken
			};

			return DavClient.propFind(url, properties, depth, headers).then(function(response) {
				if (!DavClient.wasRequestSuccessful(response.status) || response.body.propStat.length < 1) {
					throw new Error('calendar-home-set could not be determind');
				}

				const props = response.body.propStat[0].properties;
				context.calendarHome = props['{' + DavClient.NS_IETF + '}calendar-home-set'][0].textContent;
			});
		});
	}());

	context.getResourceType = function(body) {
		const resourceTypes = body.propStat[0].properties['{' + DavClient.NS_DAV + '}resourcetype'];
		if (!resourceTypes) {
			return false;
		}

		const resourceType = resourceTypes.find(function(resourceType) {
			const name = DavClient.getNodesFullName(resourceType);
			return [
				CALENDAR_IDENTIFIER,
				WEBCAL_IDENTIFIER
			].indexOf(name) !== -1;
		});

		if (!resourceType) {
			return false;
		}

		return DavClient.getNodesFullName(resourceType);
	};

	context.getShareValue = function(shareType, shareWith) {
		if (shareType !== SHARE_USER && shareType !== SHARE_GROUP) {
			throw new Error('Unknown shareType given');
		}

		let hrefValue;
		if (shareType === SHARE_USER) {
			hrefValue = 'principal:principals/users/';
		} else {
			hrefValue = 'principal:principals/groups/';
		}
		hrefValue += shareWith;

		return hrefValue;
	};

	context.isURIAvailable = function(suggestedUri) {
		const uriToCheck = context.calendarHome + suggestedUri + '/';
		return (context.usedURLs.indexOf(uriToCheck) === -1);
	};

	/**
	 * get all calendars a user has access to
	 * @returns {Promise}
	 */
	this.getAll = function() {
		return context.bootPromise.then(function() {
			const url = DavClient.buildUrl(context.calendarHome);
			const depth = 1;
			const headers = {
				'requesttoken': OC.requestToken
			};

			return DavClient.propFind(url, PROPERTIES, depth, headers).then(function(response) {
				if (!DavClient.wasRequestSuccessful(response.status)) {
					throw new Error('Loading calendars failed');
				}
				const calendars = [];

				response.body.forEach(function(body) {
					if (body.propStat.length < 1) {
						return;
					}

					// remember that url is already used
					context.usedURLs.push(body.href);

					const responseCode = DavClient.getResponseCodeFromHTTPResponse(body.propStat[0].status);
					if (!DavClient.wasRequestSuccessful(responseCode)) {
						return;
					}

					const resourceType = context.getResourceType(body);
					if (resourceType === CALENDAR_IDENTIFIER) {
						const calendar = CalendarFactory.calendar(body, context.userPrincipal);
						calendars.push(calendar);
					} else if (resourceType === WEBCAL_IDENTIFIER) {
						const webcal = CalendarFactory.webcal(body, context.userPrincipal);
						calendars.push(webcal);
					}
				});

				return calendars.filter((calendar) => calendar.components.vevent === true);
			});
		});
	};

	/**
	 * get a certain calendar by its url
	 * @param {string} calendarUrl
	 * @returns {Promise}
	 */
	this.get = function(calendarUrl) {
		return context.bootPromise.then(function() {
			const url = DavClient.buildUrl(calendarUrl);
			const depth = 0;
			const headers = {
				'requesttoken': OC.requestToken
			};

			return DavClient.propFind(url, PROPERTIES, depth, headers).then(function(response) {
				const body = response.body;
				if (body.propStat.length < 1) {
					throw new Error('Loading requested calendar failed');
				}

				const responseCode = DavClient.getResponseCodeFromHTTPResponse(body.propStat[0].status);
				if (!DavClient.wasRequestSuccessful(responseCode)) {
					throw new Error('Loading requested calendar failed');
				}

				const resourceType = context.getResourceType(body);
				if (resourceType === CALENDAR_IDENTIFIER) {
					return CalendarFactory.calendar(body, context.userPrincipal);
				} else if (resourceType === WEBCAL_IDENTIFIER) {
					return CalendarFactory.webcal(body, context.userPrincipal);
				}
			}).then(function(calendar) {
				if (calendar.components.vevent === false) {
					throw new Error('Requested calendar exists, but does not qualify for storing events');
				}

				return calendar;
			});
		});
	};

	/**
	 * get a public calendar by its public sharing token
	 * @param {string} token
	 * @returns {Promise}
	 */
	this.getPublicCalendar = function(token) {
		const urlPart = OC.linkToRemoteBase('dav') + '/public-calendars/' + token;

		const url = DavClient.buildUrl(urlPart);
		const depth = 0;
		const headers = {
			'requesttoken': OC.requestToken
		};

		return DavClient.propFind(url, PROPERTIES, depth, headers).then(function(response) {
			const body = response.body;
			if (body.propStat.length < 1) {
				throw new Error('Loading requested calendar failed');
			}

			const responseCode = DavClient.getResponseCodeFromHTTPResponse(body.propStat[0].status);
			if (!DavClient.wasRequestSuccessful(responseCode)) {
				throw new Error('Loading requested calendar failed');
			}

			return CalendarFactory.calendar(body, '', true);
		}).then(function(calendar) {
			if (calendar.components.vevent === false) {
				throw new Error('Requested calendar exists, but does not qualify for storing events');
			}

			return calendar;
		});
	};

	/**
	 * creates a new calendar
	 * @param {string} name
	 * @param {string} color
	 * @param {string[]} components
	 * @returns {Promise}
	 */
	this.create = function(name, color, components=['vevent', 'vtodo']) {
		return context.bootPromise.then(function() {
			const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton('d:mkcol', 'd:set', 'd:prop');
			dPropChildren.push({
				name: 'd:resourcetype',
				children: [{
					name: 'd:collection'
				}, {
					name: 'c:calendar'
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
				name: 'c:supported-calendar-component-set',
				children: components.map(function(component) {
					return {
						name: 'c:comp',
						attributes: {
							name: component.toUpperCase()
						}
					};
				})
			});

			const method = 'MKCOL';
			const uri = StringUtility.uri(name, context.isURIAvailable);
			const url = context.calendarHome + uri + '/';
			const headers = {
				'Content-Type' : 'application/xml; charset=utf-8',
				'requesttoken' : OC.requestToken
			};
			const xml = XMLUtility.serialize(skeleton);

			return DavClient.request(method, url, headers, xml).then(function(response) {
				if (response.status !== 201) {
					throw new Error('Creating a calendar failed');
				}

				// remember that url is now used
				context.usedURLs.push(url);

				// previously we set enabled to true,
				// because the Nextcloud server doesn't allow
				// storing custom properties on creation,
				// but this calendar will be owned by the user
				// and thereby automatically be visible
				// no need to send a request
				return context.self.get(url);
			});
		});
	};

	/**
	 * creates a new subscription
	 * @param {string} name
	 * @param {string} color
	 * @param {string} source
	 * @returns {Promise}
	 */
	this.createWebCal = function(name, color, source) {
		return context.bootPromise.then(function() {
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

			const method = 'MKCOL';
			const uri = StringUtility.uri(name, context.isURIAvailable);
			const url = context.calendarHome + uri + '/';
			const headers = {
				'Content-Type' : 'application/xml; charset=utf-8',
				'requesttoken' : OC.requestToken
			};
			const xml = XMLUtility.serialize(skeleton);

			return DavClient.request(method, url, headers, xml).then(function(response) {
				if (response.status !== 201) {
					throw new Error('Creating a webcal subscription failed');
				}

				// remember that url is now used
				context.usedURLs.push(url);

				return context.self.get(url).then(function(webcal) {
					const needsWorkaround = angular.element('#fullcalendar').attr('data-webCalWorkaround') === 'yes';
					if (needsWorkaround) {
						webcal.enabled = true;
						webcal.displayname = name;
						webcal.color = color;

						return context.self.update(webcal);
					} else {
						return webcal;
					}
				});
			});
		});
	};

	/**
	 * updates a calendar or a webcal subscription
	 * @param {Calendar|WebCal} calendar
	 * @returns {Promise}
	 */
	this.update = function(calendar) {
		const updatedProperties = calendar.getUpdated();
		// nothing changed, so why bother to send a http request?
		if (updatedProperties.length === 0) {
			return Promise.resolve(calendar);
		}

		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton('d:propertyupdate', 'd:set', 'd:prop');
		updatedProperties.forEach(function(name) {
			if (UPDATABLE_PROPERTIES.indexOf(name) === -1) {
				return;
			}

			let value = calendar[name];
			if (name === 'enabled') {
				value = value ? '1' : '0';
			}

			dPropChildren.push({
				name: UPDATABLE_PROPERTIES_MAP[name],
				value
			});
		});

		const method = 'PROPPATCH';
		const url = calendar.url;
		const headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request(method, url, headers, xml).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw new Error('Updating calendar failed');
			}

			return calendar;
		});
	};

	/**
	 * delete a calendar or a webcal subscription
	 * @param {Calendar|WebCal} calendar
	 * @returns {Promise}
	 */
	this.delete = function(calendar) {
		// :see-no-evil:
		// TODO - send hook when calendar was deleted, this doesn't belong in here
		if (WebCal.isWebCal(calendar)) {
			localStorage.removeItem(calendar.storedUrl);
		}

		const method = 'DELETE';
		const url = calendar.url;
		const headers = {
			'requesttoken': OC.requestToken
		};

		return DavClient.request(method, url, headers).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw new Error('Deleting calendar failed');
			}

			// remove deleted calendar's url from usedURLs
			const index = context.usedURLs.indexOf(url);
			context.usedURLs.splice(index, 1);
		});
	};

	/**
	 * share a calendar or update a calendar share
	 * @param {Calendar|WebCal} calendar
	 * @param {number} shareType
	 * @param {string} shareWith
	 * @param {boolean} writable
	 * @param {boolean} existingShare
	 * @returns {Promise}
	 */
	this.share = function(calendar, shareType, shareWith, writable, existingShare) {
		const [skeleton, oSetChildren] = XMLUtility.getRootSkeleton('o:share', 'o:set');

		const hrefValue = context.getShareValue(shareType, shareWith);
		oSetChildren.push({
			name: 'd:href',
			value: hrefValue
		});
		oSetChildren.push({
			name: 'o:summary',
			value: t('calendar', '{calendar} shared by {owner}', {
				calendar: calendar.displayname,
				owner: calendar.owner
			})
		});
		if (writable) {
			oSetChildren.push({
				name: 'o:read-write'
			});
		}

		const method = 'POST';
		const url = calendar.url;
		const headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request(method, url, headers, xml).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw new Error('Sharing calendar failed');
			}

			if (existingShare) {
				return;
			}

			//TODO - fix displayname
			if (shareType === SHARE_USER) {
				calendar.shares.users.push({
					id: shareWith,
					displayname: shareWith,
					writable: writable
				});
			} else {
				calendar.shares.groups.push({
					id: shareWith,
					displayname: shareWith,
					writable: writable
				});
			}
		});
	};

	/**
	 * unshare a calendar
	 * @param {Calendar|WebCal} calendar
	 * @param {number} shareType
	 * @param {string} shareWith
	 * @returns {Promise}
	 */
	this.unshare = function(calendar, shareType, shareWith) {
		const [skeleton, oRemoveChildren] = XMLUtility.getRootSkeleton('o:share', 'o:remove');

		const hrefValue = context.getShareValue(shareType, shareWith);
		oRemoveChildren.push({
			name: 'd:href',
			value: hrefValue
		});

		const method = 'POST';
		const url = calendar.url;
		const headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request(method, url, headers, xml).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw new Error('Sharing calendar failed');
			}

			if (shareType === SHARE_USER) {
				const index = calendar.shares.users.findIndex(function(user) {
					return user.id === shareWith;
				});
				calendar.shares.user.splice(index, 1);
			} else {
				const index = calendar.shares.groups.findIndex(function(group) {
					return group.id === shareWith;
				});
				calendar.shares.groups.splice(index, 1);
			}
		});
	};

	/**
	 * publish a calendar
	 * @param {Calendar} calendar
	 * @returns {Promise}
	 */
	this.publish = function(calendar) {
		const [skeleton] = XMLUtility.getRootSkeleton('cs:publish-calendar');

		const method = 'POST';
		const url = calendar.url;
		const headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request(method, url, headers, xml).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				//throw new Error('Publishing calendar failed');
				return false;
			}

			// eventually remove this return true
			return true;
		});
	};

	/**
	 * unpublish a calendar
	 * @param {Calendar} calendar
	 * @returns {Promise}
	 */
	this.unpublish = function(calendar) {
		const [skeleton] = XMLUtility.getRootSkeleton('cs:unpublish-calendar');

		const method = 'POST';
		const url = calendar.url;
		const headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request(method, url, headers, xml).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				//throw new Error('Unpublishing calendar failed');
				return false;
			}

			// eventually remove this return true
			return true;
		});
	};
});

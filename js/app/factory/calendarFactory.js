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

app.service('CalendarFactory', function($window, DavClient, Calendar, WebCal, constants) {
	'use strict';

	const context = {};

	const SHARE_USER_PREFIX = 'principal:principals/users/';
	const SHARE_GROUP_PREFIX = 'principal:principals/groups/';

	context.acl = function(props, userPrincipal) {
		const acl = props['{' + DavClient.NS_DAV + '}acl'] || [];
		let canWrite = false;

		acl.forEach(function(rule) {
			let href = rule.getElementsByTagNameNS(DavClient.NS_DAV, 'href');
			if (href.length === 0) {
				return;
			}

			if (href[0].textContent !== userPrincipal)  {
				return;
			}

			const writeNode = rule.getElementsByTagNameNS(DavClient.NS_DAV, 'write');
			if (writeNode.length > 0) {
				canWrite = true;
			}
		});

		return canWrite;
	};

	context.color = function(props) {
		const colorProp = props['{' + DavClient.NS_APPLE + '}calendar-color'];
		const fallbackColor = constants.fallbackColor;

		if (angular.isString(colorProp) && colorProp.length > 0) {
			// some stupid clients store an alpha value in the rgb hash (like #rrggbbaa) *cough cough* Apple Calendar *cough cough*
			// but some browsers can't parse that *cough cough* Safari 9 *cough cough*
			// Safari 10 seems to support this though
			if (colorProp.length === 9) {
				return colorProp.substr(0,7);
			}
			return colorProp;
		} else {
			return fallbackColor;
		}
	};

	context.components = function(props) {
		const components = props['{' + DavClient.NS_IETF + '}supported-calendar-component-set'] || [];
		const simpleComponents = {
			vevent: false,
			vjournal: false,
			vtodo: false
		};

		components.forEach(function(component) {
			const name = component.attributes.getNamedItem('name').textContent.toLowerCase();

			if (simpleComponents.hasOwnProperty(name)) {
				simpleComponents[name] = true;
			}
		});

		return simpleComponents;
	};

	context.displayname = function(props) {
		return props['{' + DavClient.NS_DAV + '}displayname'];
	};

	context.enabled = function(props, owner, currentUser) {
		if (!angular.isDefined(props['{' + DavClient.NS_OWNCLOUD + '}calendar-enabled'])) {
			if (owner) {
				return owner === currentUser;
			} else {
				return false;
			}
		} else {
			return (props['{' + DavClient.NS_OWNCLOUD + '}calendar-enabled'] === '1');
		}
	};

	context.order = function(props) {
		const prop = props['{' + DavClient.NS_APPLE + '}calendar-order'];
		return prop ? parseInt(prop) : undefined;
	};

	context.owner = function(props) {
		const ownerProperty = props['{' + DavClient.NS_DAV + '}owner'];
		if (Array.isArray(ownerProperty) && ownerProperty.length !== 0) {
			const owner = ownerProperty[0].textContent.slice(0, -1);
			const index = owner.indexOf('/remote.php/dav/principals/users/');
			if (index !== -1) {
				// '/remote.php/dav/principals/users/'.length === 33
				return owner.substr(index + 33);
			}
		}

		return null;
	};

	context.sharesAndOwnerDisplayname = function(props, owner) {
		const shareProp = props['{' + DavClient.NS_OWNCLOUD + '}invite'];
		const shares = {
			users: [],
			groups: []
		};
		let ownerDisplayname = null;

		if (!Array.isArray(shareProp)) {
			return [shares, null];
		}

		shareProp.forEach(function(share) {
			let href = share.getElementsByTagNameNS(DavClient.NS_DAV, 'href');
			if (href.length === 0) {
				return;
			}
			href = href[0].textContent;

			let displayName = share.getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'common-name');
			if (displayName.length === 0) {
				if (href.startsWith(SHARE_USER_PREFIX)) {
					displayName = href.substr(SHARE_USER_PREFIX.length);
				} else {
					displayName = href.substr(SHARE_GROUP_PREFIX.length);
				}
			} else {
				displayName = displayName[0].textContent;
			}

			let access = share.getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'access');
			if (access.length === 0) {
				return;
			}
			access = access[0];

			let writable = access.getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'read-write');
			writable = writable.length !== 0;

			if (href.startsWith(SHARE_USER_PREFIX)) {
				if (href.substr(SHARE_USER_PREFIX.length) === owner) {
					ownerDisplayname = displayName;
				} else {
					shares.users.push({
						id: href.substr(SHARE_USER_PREFIX.length),
						displayname: displayName,
						writable: writable
					});
				}
			} else if (href.startsWith(SHARE_GROUP_PREFIX)) {
				shares.groups.push({
					id: href.substr(SHARE_GROUP_PREFIX.length),
					displayname: displayName,
					writable: writable
				});
			}
		});

		return [shares, ownerDisplayname];
	};

	context.shareableAndPublishable = function(props, writable, publicMode) {
		let shareable = false;
		let publishable = false;

		if (publicMode || !writable) {
			return [shareable, publishable];
		}

		const sharingModesProp = props['{' + DavClient.NS_CALENDARSERVER + '}allowed-sharing-modes'];
		if (!Array.isArray(sharingModesProp) || sharingModesProp.length === 0) {
			// Fallback if allowed-sharing-modes is not provided
			return [writable, publishable];
		}

		for (let shareMode of sharingModesProp) {
			shareable = shareable || shareMode.localName === 'can-be-shared';
			publishable = publishable || shareMode.localName === 'can-be-published';
		}

		return [shareable, publishable];
	};

	context.publishedAndPublicToken = function(props) {
		let published = false;
		let publicToken = null;

		if (angular.isDefined(props['{' + DavClient.NS_CALENDARSERVER + '}publish-url'])) {
			published = true;
			let publishURL = props['{' + DavClient.NS_CALENDARSERVER + '}publish-url'][0].textContent;
			if (publishURL.substr(-1) === '/') {
				publishURL = publishURL.substr(0, publishURL.length - 1);
			}

			const lastIndexOfSlash = publishURL.lastIndexOf('/');
			publicToken = publishURL.substr(lastIndexOfSlash + 1);
		}

		return [published, publicToken];
	};


	context.webcal = function(props) {
		const sourceProp = props['{' + DavClient.NS_CALENDARSERVER + '}source'];

		if (Array.isArray(sourceProp)) {
			const source = sourceProp.find(function(source) {
				return (DavClient.getNodesFullName(source) === '{' + DavClient.NS_DAV + '}href');
			});

			return source ? source.textContent : null;
		} else {
			return null;
		}
	};

	context.calendarSkeleton = function(props, userPrincipal, publicMode) {
		const simple = {};
		const currentUser = context.getUserFromUserPrincipal(userPrincipal);

		simple.color = context.color(props);
		simple.displayname = context.displayname(props);
		simple.components = context.components(props);
		simple.order = context.order(props);

		simple.writable = context.acl(props, userPrincipal);
		simple.owner = context.owner(props);
		simple.enabled = context.enabled(props, simple.owner, currentUser);

		const [shares, ownerDisplayname] = context.sharesAndOwnerDisplayname(props, simple.owner);
		simple.shares = shares;
		simple.ownerDisplayname = ownerDisplayname;

		const [shareable, publishable] = context.shareableAndPublishable(props, simple.writable, publicMode);
		simple.shareable = shareable;
		simple.publishable = publishable;

		const [published, publicToken] = context.publishedAndPublicToken(props);
		simple.published = published;
		simple.publicToken = publicToken;

		// always enabled calendars in public mode
		if (publicMode) {
			simple.enabled = true;
			simple.writable = false;
			simple.color = constants.fallbackColor;
		}

		simple.writableProperties = (currentUser === simple.owner) && simple.writable;

		return simple;
	};

	context.getUserFromUserPrincipal = function(userPrincipal) {
		if (userPrincipal.endsWith('/')) {
			userPrincipal = userPrincipal.slice(0, -1);
		}

		const slashIndex = userPrincipal.lastIndexOf('/');
		return userPrincipal.substr(slashIndex + 1);
	};

	/**
	 * get a calendar object from raw xml data
	 * @param {object} CalendarService
	 * @param body
	 * @param {string} userPrincipal
	 * @param {boolean} publicMode
	 * @returns {Calendar}
	 */
	this.calendar = function(CalendarService, body, userPrincipal, publicMode=false) {
		const href = body.href;
		const props = body.propStat[0].properties;

		const simple = context.calendarSkeleton(props, userPrincipal, publicMode);
		return Calendar(CalendarService, href, simple);
	};

	/**
	 * get a webcal object from raw xml data
	 * @param {object} CalendarService
	 * @param body
	 * @param {string} userPrincipal
	 * @param {boolean} publicMode
	 * @returns {WebCal}
	 */
	this.webcal = function(CalendarService, body, userPrincipal, publicMode=false) {
		const href = body.href;
		const props = body.propStat[0].properties;
		const currentUser = context.getUserFromUserPrincipal(userPrincipal);

		const simple = context.calendarSkeleton(props, userPrincipal, publicMode);
		simple.href = context.webcal(props);

		// WebCal is obviously not writable
		simple.writable = false;
		simple.writableProperties = (currentUser === simple.owner);

		// WebCal subscriptions are neither publishable nor shareable
		simple.publishable = false;
		simple.shareable = false;

		return WebCal(CalendarService, href, simple);
	};
});

/**
 * ownCloud - Calendar App
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

app.service('WebCalService', function ($http, ICalSplitterUtility, WebCalUtility, SplittedICal) {
	'use strict';

	const self = this;
	const context = {
		cachedSplittedICals: {}
	};

	this.get = function(webcalUrl, allowDowngradeToHttp) {
		if (context.cachedSplittedICals.hasOwnProperty(webcalUrl)) {
			return Promise.resolve(context.cachedSplittedICals[webcalUrl]);
		}

		if (allowDowngradeToHttp === undefined) {
			allowDowngradeToHttp = WebCalUtility.allowDowngrade(webcalUrl);
		}

		webcalUrl = WebCalUtility.fixURL(webcalUrl);
		const url = WebCalUtility.buildProxyURL(webcalUrl);

		let localWebcal = JSON.parse(localStorage.getItem(webcalUrl));
		if (localWebcal && localWebcal.timestamp > new Date().getTime()) {
			return Promise.resolve(ICalSplitterUtility.split(localWebcal.value));
		}

		return $http.get(url).then(function(response) {
			const splitted = ICalSplitterUtility.split(response.data);

			if (!SplittedICal.isSplittedICal(splitted)) {
				return Promise.reject(t('calendar', 'Please enter a valid WebCal-URL'));
			}

			context.cachedSplittedICals[webcalUrl] = splitted;
			localStorage.setItem(webcalUrl, JSON.stringify({value: response.data, timestamp: new Date().getTime() + 7200000})); // That would be two hours in milliseconds

			return splitted;
		}).catch(function(e) {
			if (WebCalUtility.downgradePossible(webcalUrl, allowDowngradeToHttp)) {
				const httpUrl = WebCalUtility.downgradeURL(webcalUrl);

				return self.get(httpUrl, false).then(function(splitted) {
					context.cachedSplittedICals[webcalUrl] = splitted;
					return splitted;
				});
			}

			if (e.status === 422) {
				return Promise.reject({
					error: true,
					redirect: false,
					message: e.data.message
				});
			} else if(e.status === 400) {
				return Promise.reject({
					error: false,
					redirect: true,
					new_url: e.data.new_url
				});
			} else {
				return Promise.reject({
					error: true,
					redirect: false,
					message: t('calendar', 'Severe error in webcal proxy. Please contact administrator for more information.')
				});
			}
		});
	};
});

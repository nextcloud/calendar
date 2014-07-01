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

 app.factory('SubscriptionModel', function() {
	var SubscriptionModel = function () {
		this.subscriptions = [];
		this.subscriptionId = {};
	};

	SubscriptionModel.prototype = {
		create : function (newsubscription) {
			this.subscriptions.push(newsubscription);
		},
		add : function (subscription) {
			this.updateIfExists(subscription);
		},
		addAll : function (subscriptions) {
			for(var i=0; i<subscriptions.length; i++) {
				this.add(subscriptions[i]);
			}
		},
		getAll : function () {
			return this.subscriptions;
		},
		get : function (id) {
			return this.subscriptionId[id];
		},
		updateIfExists : function (updated) {
			var subscription = this.subscriptionId[updated.id];
			if(angular.isDefined(subscription)) {

			} else {
				this.subscriptions.push(updated);
				this.subscriptionId[updated.id] = updated;
			}
		},
		remove : function (id) {
			for(var i=0; i<this.subscriptions.length; i++) {
				var subscription = this.subscriptions[i];
				if (subscription.id === id) {
					this.subscriptions.splice(i, 1);
					delete this.subscriptionId[id];
					break;
				}
			}
		},
	};

	return new SubscriptionModel();
});
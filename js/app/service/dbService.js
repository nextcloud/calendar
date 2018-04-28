/**
 * ownCloud - Calendar App
 *
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

app.service('DbService', ['$rootScope', '$window',
	function ($rootScope, $window) {
		'use strict';

		this.findUserLayers = function () {
			var path = OC.generateUrl('/apps/calendar')+'/otoSL/fUL';
			var ret;
			$.ajax({
				type: "GET",
				async: false,
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(res){
				ret = res;
			}).fail(function () {
				console.log("fail to findUserLayers");
			});
			return ret;
		};

		this.createConfirmation = function (otoLayerId, password, eventId, name) {
			var path = OC.generateUrl('/apps/calendar')+'/otoSC/create';
			$.ajax({
				type: "POST",
				data: {
					'otoLayerId':otoLayerId,
					'password':password,
					'eventId':eventId,
					'name':name
				},
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(response){
				$window.alert("Your confirmation was successful, "+ name + "!");
				return response;
			}).fail(function () {
				$window.alert("Failed to create confirmation: "+ path);
			});
		};

		this.createOtoLayer = function (sourceId, destId) {
			var path = OC.generateUrl('/apps/calendar')+'/otoSL/create';
			$.ajax({
				type: "POST",
				data: {
					'sourceId':sourceId,
					'destId':destId
				},
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(response){
				return response;
			}).fail(function () {
				$window.alert("failed createOtoLayer: "+ path);
			});
		};

		this.deleteBySourceId = function (sourceId) {
			var path = OC.generateUrl('/apps/calendar') + '/otoSL/dL';
			$.ajax({
				type: "POST",
				async: false,
				data: {
					'sourceId':sourceId
				},
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path,
			}).done(function(response){
				console.log('deleted BySourceId');
			}).fail(function() {
				console.log("Failed deleteBySourceId: " + path);
			});
		};

		this.isSchedulingLayer = function (sourceId) {
			var path = OC.generateUrl('/apps/calendar' + '/otoSL/iSL');
			$.ajax({
				type: "POST",
				data: {
					'sourceId':sourceId
				},
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path,
			}).done(function(response){
				return response;
			}).fail(function() {
				console.log("Failed isSchedulingLayer: " + path);
			});
		};

		this.getConfirmationsByUser = function () {
			var path = OC.generateUrl('/apps/calendar')+'/otoSC/gCBU';
			var ret;
			$.ajax({
				type: "GET",
				async: false,
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(res){
				ret = res;
				console.log('in dbservice:'+ret);
			}).fail(function () {
				console.log("failed confirmationsByUser: "+ path);
			});
			return ret;
		};

	}
]);

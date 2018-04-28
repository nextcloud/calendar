app.controller('OtoscController', ['$scope','$window', function($scope,$window) {
		'use strict';
		
		//ajax way
		$scope.test435 = function(){
			
			var path = OC.generateUrl('/apps/calendar')+'/otoSC/create';
			//'/index.php/apps/calendar/test/1/';
			//$window.alert(path);
			$.ajax({
				type: "POST",
				data: {
					'otoLayerId':'11',
					'password':'password',
					'eventId':'1',
					'name':'passwordchecktest'
				},
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(test){
				$window.alert(test);
			}).fail(function () {
				$window.alert("failed: "+path);
			});
		};
		
		$scope.test2 = function(){
			
			var path = OC.generateUrl('/apps/calendar')+'/otoSC/test';
			//'/index.php/apps/calendar/test/1/';
			//$window.alert(path);
			$.ajax({
				type: "GET",
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(test){
				$window.alert(test);
			}).fail(function () {
				$window.alert("failed: "+path);
			});
		};
		
		$scope.test3 = function(){
			var path = OC.generateUrl('/apps/calendar')+'/otoSC/test';
			//'/index.php/apps/calendar/test/1/';
			//$window.alert(path);
			$.ajax({
				type: "GET",
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(test){
				$window.alert(test);
			}).fail(function () {
				$window.alert("failed: "+path);
			});
		};
}]);
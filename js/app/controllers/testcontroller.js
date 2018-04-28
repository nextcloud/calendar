app.controller('TestController', ['$scope','$window', 'DavClient', function($scope,$window,DavClient) {
		'use strict';
		
		$scope.user='not found';
		//dav client way
		$scope.test2 = function(){
			var path = OC.generateUrl('/apps/calendar')+'/test/test';
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
		//ajax way
		$scope.test435 = function(){
			
			var path = OC.generateUrl('/apps/calendar')+'/test/test';
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
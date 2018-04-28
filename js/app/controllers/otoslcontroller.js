app.controller('OtoslController', ['$scope','$window', function($scope,$window) {
		'use strict';
		
		//ajax way
		$scope.test435 = function(){
			
			var path = OC.generateUrl('/apps/calendar')+'/otoSL/create';
			//'/index.php/apps/calendar/test/1/';
			//$window.alert(path);
			$.ajax({
				type: "POST",
				data: {
					'sourceId':'435',
					'destId':'436'
				},
				beforeSend: function(request){
					request.setRequestHeader('requesttoken', OC.requestToken);
				},
				url: path ,
			}).done(function(test){
				$window.console.log(test);
			}).fail(function () {
				$window.console.log("failed: "+path);
			});
		};
}]);
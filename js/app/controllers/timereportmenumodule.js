app.controller('ModalDemoCtrl',['$rootScope','$scope','VEvent','settings','TimezoneService','$uibModal', '$log', '$document', 'CalendarService', 'VEventService', 'DbService', '$q', '$window','fc',
  function ($rootScope,$scope,VEvent, settings,TimezoneService,$uibModal, $log, $document, CalendarService, VEventService, DbService, $q, $window,fc) {
  'use strict';

  if (settings.timezone === 'automatic') {
    $scope.defaulttimezone = TimezoneService.getDetected();
  } else {
    $scope.defaulttimezone = settings.timezone;
  }
  $scope.init = function (sourceId) {
    $scope.sourceId = sourceId;
  };
  var $ctrl = this;
  var isOpen = false;
  $ctrl.layers = [];
  

  $ctrl.openOTOScheduling = function(size, parentSelector){

    CalendarService.getAll().then(function (result){
      console.log(result);
      $ctrl.layers = [];
      for (var i = 0; i < result.length; i++) {
        if (result[i].isWritable() === true) {
          $ctrl.layers.push(result[i]);
        }
      }
      $ctrl.destLayer = null;

      if(isOpen){return;}
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'OTOModalContent.html',
        controller: 'OTOModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {

          layers: function () {
            return $ctrl.layers;
          },
          destLayer : function(){
            return $ctrl.destLayer;
          }
        }
      });

      isOpen = true;

      modalInstance.result.then(function(data){
        isOpen = false;
        $ctrl.destLayer = data.destLayer;
		$ctrl.timeBlockSize = data.timeBlockSize;

        // deleteBySourceId
        DbService.deleteBySourceId($scope.sourceId);

        var layerId, layerPass;
        var path = OC.generateUrl('/apps/calendar')+'/otoSL/create';
        $.ajax({
          type: "POST",
          data: {
            'sourceId':$scope.sourceId,
            'destId':data.destLayer.url
          },
          beforeSend: function(request){
            request.setRequestHeader('requesttoken', OC.requestToken);
          },
          async: false,
          url: path ,
        }).done(function(response){
          layerId = response.otoLayerId;
          layerPass = response.password;
        }).fail(function () {
        });

        var chopEvent = function(calendar,event,slot) {
          //console.log("start: " + moment(event.comp.jCal[2][0][1][5][3]).format());
          var mmt = moment(event.comp.jCal[2][0][1][5][3]);
          var endMmt = moment(event.comp.jCal[2][0][1][6][3]);
          console.log(mmt.format());
          console.log(endMmt.format());
          if (mmt.clone().add(slot,'minutes')<endMmt) {
            while(mmt.clone().add(slot,'minutes') < endMmt){
              var newEvent = VEvent.fromStartEnd(mmt,mmt.clone().add(slot,'minutes'),$scope.defaulttimezone);
              var summary = event.comp.jCal[2][0][1][4].slice();
              summary[3] = 'slot';
              newEvent.comp.jCal[2][0][1].splice(4,0,summary);
              console.log(newEvent.comp);
              VEventService.create(calendar,newEvent.comp.toString());
              mmt = mmt.clone().add(slot,'minutes');
            }
            VEventService.delete(event);
          }

        };

        // Get the meeting scheduling URL
        CalendarService.get($scope.sourceId).then(function(calendar){
          var currentMoment = moment();
          var getStart = currentMoment.clone().add(-1,'year');
          var getEnd = currentMoment.clone().add(1,'year');
          console.log(getStart.format());
          console.log(getEnd.format());
          VEventService.getAll(calendar,getStart,getEnd).then(function(events){
            console.log(events);
            for (var i = 0; i < events.length; i++) {
              chopEvent(calendar,events[i],$ctrl.timeBlockSize);
            }

            let displayname = calendar.displayname
              .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
              .replace(/\-\-+/g, '-').replace(/^-+/, '')
              .replace(/-+$/, '');
            $window.open( $rootScope.root + 'p/' + calendar.publicToken  + '/' + displayname + '/schedule' + '/' + layerId + '/' + layerPass);
          });


        });

      }, function () {
        isOpen = false;
      });

    });

  };


  $ctrl.open = function (size, parentSelector) {

    CalendarService.getAll().then(function (result){
      $ctrl.layers = [];
      for (var i = 0; i < result.length; i++) {
        $ctrl.layers.push(result[i]);
      }

      $ctrl.items = ['item1', 'item2', 'item3'];
      $ctrl.selectedLayers = [];

      if(isOpen){return;}

      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          items: function () {
            return $ctrl.items;
          },
          layers: function () {
            return $ctrl.layers;
          },
          selectedLayers: function() {
            return $ctrl.selectedLayers;
          }
          // calendar: () => calendar,
        }
      });

      isOpen = true;

      modalInstance.result.then(function (data) {
        isOpen = false;
        if(data.selectedLayers.length < 1){return;}
        $ctrl.selectedLayers = data.selectedLayers;
        $ctrl.start = data.start;
        $ctrl.end = data.end;

        var calLayerEvents = [];
        for (var i = 0; i < $ctrl.selectedLayers.length; i++) {
          calLayerEvents.push(VEventService.getAll($ctrl.selectedLayers[i], $ctrl.start, $ctrl.end));
        }

        var results = {};
        $q.all(calLayerEvents).then(function(data){
          for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
              var minuteDiff = data[i][j].getSimpleEvent().dtend.value.diff(data[i][j].getSimpleEvent().dtstart.value,"minutes");
              if(results[$ctrl.selectedLayers[i].displayname]){
                results[$ctrl.selectedLayers[i].displayname] += minuteDiff;
              } else{
                results[$ctrl.selectedLayers[i].displayname] = minuteDiff;
              }

            }
          }

          var text = "";
          text = text + "Layers,Time(Minutes)\n";
          var total = 0;
          angular.forEach(results, function(value, key){
            total += value;
            text = text + "\"" + key + "\"" + "," + "\"" + value + "\"" + "\n";
          });
          text = text + "\"" + "Total" + "\"" + "," + total + "\n";

          var element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
          element.setAttribute('download', "timereport.csv");
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        });

      }, function () {
        isOpen = false;
      });
    });

  };


  $ctrl.toggleAnimation = function () {
    $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
  };
}]);

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

app.controller('ModalInstanceCtrl',  function ( $uibModalInstance, layers) {
  'use strict';
  var $ctrl = this;

  $ctrl.layers = layers;
  $ctrl.data = {
    selectedLayers : $ctrl.layers,
    start : moment(),
    end : moment()
  };




  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.data);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('OTOModalInstanceCtrl',  function ( $uibModalInstance, layers) {
  'use strict';
  var $ctrl = this;

  $ctrl.layers = layers;
  $ctrl.data = {
    destLayer : $ctrl.layers[0],
	timeBlockSize : 1440
  };



  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.data);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
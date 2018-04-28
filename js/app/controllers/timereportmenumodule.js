app.controller('ModalDemoCtrl',['$rootScope','$scope','$uibModal', '$log', '$document', 'CalendarService', 'VEventService', 'DbService', '$q', '$window',
  function ($rootScope,$scope, $uibModal, $log, $document, CalendarService, VEventService, DbService, $q, $window) {
  'use strict';


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
          // calendar: () => calendar,
        }
      });

      isOpen = true;

      modalInstance.result.then(function(data){
        isOpen = false;
        //$ctrl.sourceLayer = data.sourceLayer;
        $ctrl.destLayer = data.destLayer;

        //CODE FOR OTO SCHEDULING GOES HERE. SOURCE AND DEST LAYERS ARE CALENDAR
        //OBJECTS STORED IN $ctrl.source.. AND $ctrl.dest...

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
          //console.log(response);
          layerId = response.otoLayerId;
          layerPass = response.password;
        }).fail(function () {
          //console.log("failed createOtoLayer: "+ path);
        });

        //console.log('layerId: ' + layerId + ' layerPass: ' + layerPass);

        // Get the meeting scheduling URL
        CalendarService.get($scope.sourceId).then(function (calendar) {
          let displayname = calendar.displayname
            .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-').replace(/^-+/, '')
            .replace(/-+$/, '');
          $window.open( $rootScope.root + 'p/' + calendar.publicToken  + '/' + displayname + '/schedule' + '/' + layerId + '/' + layerPass);
        });

      }, function () {
        isOpen = false;
        //$log.info('OTO Modal REJECT dismissed at: ' + new Date());
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
        //TODO NEED TO ADDRESS BUG WHERE START AND END TIME ARE THE SAME. DAVCLIENT GLITCHES
        //SHOULD BE ABLE TO JUST RETURN IF IT'S NOTICED THAT THE DIFF IS 0.
        isOpen = false;
        // $log.info(selectedLayers);
        //Check if no layers selected. Just return if so.
        if(data.selectedLayers.length < 1){return;}
        $ctrl.selectedLayers = data.selectedLayers;
        // $log.info($ctrl.selectedLayers);
        $ctrl.start = data.start;
        $ctrl.end = data.end;

        //Put all promises into the array.
        var calLayerEvents = [];
        for (var i = 0; i < $ctrl.selectedLayers.length; i++) {
          calLayerEvents.push(VEventService.getAll($ctrl.selectedLayers[i], $ctrl.start, $ctrl.end));
        }

        //Use $q.all to wait on all promises to resolve. When they are done,
        //sum each data[i] for each layer, then sum each sum for the total time spent. Maybe just a summary for each layer?
        var results = {};
        $q.all(calLayerEvents).then(function(data){
          // $log.info(data);
          // $log.info("datalen" + data.length);
          // $log.info("data[0]len" + data[0].length);
          for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
              // $log.info(data[i][j]);
              // $log.info(data[i][j].getSimpleEvent().dtstart);
              var minuteDiff = data[i][j].getSimpleEvent().dtend.value.diff(data[i][j].getSimpleEvent().dtstart.value,"minutes");
              //$log.info(minuteDiff);
              // var hourDur = Math.floor(minuteDiff/60);
              // var minuteDur = minuteDiff % 60;
              // $log.info("Hours: " + hourDur + "  Minutes: " + minuteDur);
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
          //Should I just make this in raw minutes? Would be easier to add up.
          angular.forEach(results, function(value, key){
            //$log.info("key : "+ key + "  value : " + value);
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
        //$log.info('Modal dismissed at: ' + new Date());
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
    //TODO Need to add the two moment objects(?) to this data. MAKE SURE YOU USE
    //THE RIGHT MODEL ON THE PHP PAGE!!!!!
    selectedLayers : $ctrl.layers,
    start : moment(),
    end : moment()
  };



  $ctrl.ok = function () {
    // $ctrl.isOpen = false;
    // $log.info("instance" + $ctrl.layers);
    $uibModalInstance.close($ctrl.data);
  };

  $ctrl.cancel = function () {
    // $ctrl.isOpen = false;
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('OTOModalInstanceCtrl',  function ( $uibModalInstance, layers) {
  'use strict';
  var $ctrl = this;

  $ctrl.layers = layers;
  $ctrl.data = {
    //TODO Need to add the two moment objects(?) to this data. MAKE SURE YOU USE
    //THE RIGHT MODEL ON THE PHP PAGE!!!!!
    //sourceLayer : $ctrl.layers[0],
    destLayer : $ctrl.layers[0]
  };



  $ctrl.ok = function () {
    // $ctrl.isOpen = false;
    // $log.info("instance" + $ctrl.layers);
    $uibModalInstance.close($ctrl.data);
  };

  $ctrl.cancel = function () {
    // $ctrl.isOpen = false;
    $uibModalInstance.dismiss('cancel');
  };
});

// Please note that the close and dismiss bindings are from $uibModalInstance.

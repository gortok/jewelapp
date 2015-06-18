'use strict';
angular.module('jewelApp.controllers')
.controller('PairCtrl',['$scope', '$state', '$timeout', 'JewelbotService','$logService', function($scope, $state, $timeout, JewelbotService, $logService){
    //$scope.model = {
    //};
    $scope.model = {
      status : [],
      devices : [],
      errors : [],
      messages : []
    };
    $scope.getErrors = function() {
      $timeout(function() {
        $scope.model.errors = $logService.GetErrors();
      });
    };
    $scope.getMessages = function () {
      $timeout(function() {
        $scope.model.messages = $logService.GetMessages();
      });
    };
    $scope.pairToDevice = function(device) {
        var paired = JewelbotService.Pair(device);
        if (paired.result === 'success') {
          $state.transitionTo('pair-success', device.name);
        }
        else {
          $scope.model.status.push('didn\'t succeed' + paired);
        }
    };
    $scope.getAvailableDevices = function() {
      try {
        $logService.LogMessage('Getting devices');
        var params = {serviceUuids: []};
        JewelbotService.GetDevices(params).then(function (results) {
          $logService.LogMessage('got devices' + JSON.stringify(results));
        }, function(error) {
          $logService.LogMessage('logging error from get devices: ' + JSON.stringify(error));
        });
      //.then(function (response) {
      //      $logService.LogMessage('scan:\n' + JSON.stringify(response));
      //      if (response.status === 'scanResult') {
      //        $logService.LogMessage('result of scan:\n' + JSON.stringify(response));
      //        var d = response;
      //        $cordovaBluetoothle.stopScan().then(function(stopped){
      //          $logService.LogMessage('stopping scan: ' + JSON.stringify(stopped));
      //          return d;
      //        });
      //      }
      //      else {
      //        $logService.LogMessage('still scanning:\n' + JSON.stringify(response));
      //      }
      //    },
      //    function (error) {
      //      $logService.LogError(error, 'Failed to Start Scan');
      //      return error;
      //    });
      }
      catch (e) {
        $logService.LogError('error was: ' + JSON.stringify(e));
      }
    };
    $scope.clearLog = function () {
      $logService.Clear();
    };

}])

.controller('RegistrationCtrl', function(){

});

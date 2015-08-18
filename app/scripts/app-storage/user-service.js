'use strict';
angular.module('jewelApp.services')
  .factory('UserService',
  ['$cordovaBluetoothle',
    '$ionicPlatform',
    '$logService',
    '$q',
    '$timeout',
    'CryptoJS',
    'DataService',
    'Parse',
    function (
      $cordovaBluetoothle,
      $ionicPlatform,
      $logService,
      $q,
      $timeout,
      CryptoJS,
      DataService,
      Parse) {
      var self = this;

      var service = {
        AgreedToPrivacyPolicy : function () {
          return DataService.AgreedToPrivacyPolicy();
        },
        SetPrivacyPolicy : function (valueSet) {
          DataService.SetPrivacyPolicy(valueSet);
        },
        GetFriends : function () {
          return DataService.GetFriends();
        },
        HasFriends : function () {
          if (self.GetFriends() > 0) {
            return true; //yes, I know I shouldn't return true; there's more coming.
          }
          else if (self.IsRegistered()) { //no friends in app; check online in case new app install
            return DataService.HasFriends();
          }
          else { //can't check online, and locally has no friends. Say no friends.  App should sync with jewelbot after every action; so assume this is up to date
            return false;
          }
        },
        SendFriendRequests : function (request) {
         try {
           Parse.initialize('aRsOu0eubWBbvxFjPiVPOnyXuQjhgHZ1sjpVAvOM', 'p8qy8tXJxME6W7Sx5hXiHatfFDrmkNoXWWvqksFW');
           var q = $q.defer();
           var requests = [];
           $logService.Log('message', 'entering sendFriendRequests' + JSON.stringify(request));
           DataService.GetDailySalt().then(function (result) {
             $logService.Log('message', 'inside of then for dailySalt ' + JSON.stringify(result));
             var FriendRequest = Parse.Object.extend('FriendRequests');
             var salt = result;
             var requestorDeviceId = DataService.GetDeviceId();
             $logService.Log('message', 'inside of requestorDeviceId ' + JSON.stringify(requestorDeviceId));
             var requestorHash = CryptoJS.PBKDF2(DataService.GetPhoneNumber(), salt, {
               keySize: 256 / 32,
               iterations: 10
             });
             for (var i = 0; i < request.friends.length; i = i + 1) {
               $logService.Log('message', 'Entering loop to send friends');
               var r = new FriendRequest();
               r.set('RequestorHash', requestorHash.toString());
               $logService.Log('message', 'Entered Loop: requestorHash '+ JSON.stringify(requestorHash));
               r.set('RecipientHash', CryptoJS.PBKDF2(request.friends[i], salt, {
                 keySize: 256 / 32,
                 iterations: 10
               }));
               r.set('Color', request.color);
               r.set('RequestorDeviceId', requestorDeviceId);
               requests.push(r);
             }
           }).then(function () {
             Parse.Object.saveAll(requests, {
               success: function (objs) {
                 $logService.Log('message', 'saved succeeded! ' + JSON.stringify(objs));
                 q.resolve(objs);
               },
               error: function (error) {
                 $logService.Log('error', 'error saving requests: ' + JSON.stringify(error));
                 q.reject(error);
               }
             });
           });
           return q.promise;
         }
         catch (error) {
          $logService.Log('had error sending friends: ' + JSON.stringify(error));
         }
        },
        IsRegistered : function () {
          return DataService.IsRegistered();
        },
        HasPhoneNumber : function () {
          return DataService.HasPhoneNumber();
        },
        SetPhoneNumber : function (unHashedNumber) {
          DataService.SetPhoneNumber(unHashedNumber);
        }
      };
      return service;
    }]);

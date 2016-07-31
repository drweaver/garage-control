/* global io angular location */
// Maximum retries before performing full page refresh.
var MAX_RETRIES = 3;

var app = angular.module('GcApp', ['ngNotify']);

app.controller('MainController', [ '$scope', '$timeout', 'onFix', 'ngNotify', function($scope, $timeout, onFix, ngNotify) {
    
  var socket = io.connect( location.origin, { 'path': '/gc/socket.io'} );

  $scope.connected = false;
  $scope.latlngAuthorised = false;
  $scope.canOperate = true;
  $scope.retries = 0;
  
  $scope.checkPosition = function() {
    if( $scope.latlng && socket.connected ) {
      socket.emit('position', $scope.latlng, function(authorised) {
        $scope.latlngAuthorised = authorised;
        $scope.$apply();
      });
    } 
  };
  
  var posAuthorised = function(callback) {
    if( $scope.latlngAuthorised === true ) {
      callback();
    } else {
      var dewatch =  $scope.$watch('latlngAuthorised', function(newVal) {
        // assume no other option but to be true at this point
        console.log('$watch latlngAuthorised='+$scope.latlngAuthorised);
        if( newVal === true ) {
          dewatch();
          callback();
        }
      });
    }
  }
  
  var socketReady = function(callback) {
    if( $scope.connected ) {
      callback();
    } else {
      var listener = socket.on('connect', function() {
        socket.removeListener('connect', listener);
        callback();
      });
    }
  };
  
  $scope.operateDoor = function() {
    console.log('latlngAuthorised='+$scope.latlngAuthorised);
    var maxTime = 10000;
    var timeout = new Date().getTime() + maxTime;
    var promise = $timeout(function() {
      $scope.canOperate=true;
      ngNotify.set('Door NOT operated', {type: 'error', sticky: true});
    }, maxTime);
    $scope.canOperate = false;
    posAuthorised( function() {
      socketReady( function() {
        if( new Date().getTime() > timeout ) return;
        socket.emit('operate', function(status, msg) {
          $timeout.cancel(promise);
          $scope.canOperate = true;
          ngNotify.set(msg, { type: status});
          $scope.$apply();
        });
      });
    });
  };
  
  socket.on('connect', function() {
    $scope.connected = true;
    $scope.retries = 0;
    $scope.checkPosition();
    $scope.$apply();
  });
  
  socket.on('reconnecting', function(num) {
    if( $scope.retries > MAX_RETRIES ) {
      location.reload();
    }
    $scope.retries++;
    $scope.$apply();
  });
  
  socket.on('disconnect', function() {
    $scope.connected = false;
    $scope.latlngAuthorised = false;
    $scope.retries = 0;
    ngNotify.set('Lost connection to server', {type: 'error', sticky: true});
    $scope.$apply();
  });
  
  socket.on('status', function(status) {
    $scope.status = status;
    ngNotify.set('Garage is '+status, {type: 'info'});
    $scope.$apply();
  });
  
  onFix( function(latlng) {
    $scope.latlng = latlng;
    $scope.checkPosition();
  });
  
  window.document.addEventListener("visibilitychange", function(e) {
    if( window.document.visibilityState == 'hidden' ) {
      socket.disconnect();
    }
    if( window.document.visibilityState == 'visible' ) {
      socket.connect();
    }
    $scope.$apply();
  });

}]); /*- end controller -*/

app.factory('onFix', [ '$timeout', function($timeout) {
  
  var listeners = [];
  var latlng;
  
  if (navigator.geolocation) {
    console.log('geolocation available');
    var distance = function(lat1,lng1,lat2,lng2) {
      var R = 6371; // km
      var φ1 = lat1.toRadians();
      var φ2 = lat2.toRadians();
      var λ1 = lng1.toRadians();
      var λ2 = lng2.toRadians();
      var x = (λ2-λ1) * Math.cos((φ1+φ2)/2);
      var y = (φ2-φ1);
      var d = Math.sqrt(x*x + y*y) * R; 
      //console.log("distance moved = " + Math.floor(d) + " km");
      return d;
    };
    /** Extend Number object with method to convert numeric degrees to radians */
    if (typeof Number.prototype.toRadians == 'undefined') {
      Number.prototype.toRadians = function() { return this * Math.PI / 180; };
    }
    var updatePos = function(position) {
      if( latlng === undefined || distance(latlng.lat,latlng.lng,position.coords.latitude,position.coords.longitude) > 1) {
        latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
        for (var i in listeners) {
          listeners[i](latlng);
        }
      }
    };
  
    navigator.geolocation.getCurrentPosition(function(position) {
      updatePos(position);
      navigator.geolocation.watchPosition(updatePos);
    });

    return function(listener) {
      if( latlng !== undefined ) listener(latlng);
      listeners.push(listener);
    }
  }
}]);


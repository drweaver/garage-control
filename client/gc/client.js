var app = angular.module('GcApp', []);

app.controller('MainController', [ '$scope', '$timeout', 'onFix', function($scope, $timeout, onFix) {
    
  var socket = io.connect( location.origin, { 'path': '/gc/socket.io'} );

  $scope.connected = false;
  $scope.latlngAuthorised = false;
  $scope.canOperate = true;
  
  $scope.checkPosition = function() {
    if( $scope.latlng && socket.connected ) {
      socket.emit('position', $scope.latlng, function(authorised) {
        $scope.latlngAuthorised = authorised;
        $scope.$apply();
      });
    } 
  };
  
  var fixReady = function(callback) {
    if( $scope.latlng ) {
      callback( $scope.latlng );
    } else {
      onFix( callback, true );
    }
  }
  
  var socketReady = function(callback) {
    if( $scope.connected ) {
      callback();
    } else {
      var listener = socket.on('connect', function() {
        callback();
        socket.removeListener('connect', listener);
      });
    }
  }
  
  $scope.operateDoor = function() {
    var maxTime = 10000;
    var timeout = new Date().getTime() + maxTime;
    var promise = $timeout(function() {
      $scope.canOperate=true;
      $scope.log= 'Door NOT operated';
    }, maxTime);
    $scope.canOperate = false;
    fixReady( function(latlng) {
      socketReady( function() {
        if( new Date().getTime() > timeout ) return;
        socket.emit('operate', $scope.latlng, function(msg) {
          $scope.canOperate = true;
          $scope.log = msg;
          $timeout.cancel(promise);
          $scope.$apply();
        });
      });
    })
  };
  
  socket.on('connect', function() {
    $scope.connected = true;
    $scope.checkPosition();
    $scope.log = '';
    $scope.$apply();
  });
  
  socket.on('reconnecting', function(num) {
    $scope.log = 'Reconnection attempt number '+ num;
    $scope.$apply();
  });
  
  socket.on('disconnect', function() {
    $scope.connected = false;
    $scope.log = '';
    $scope.$apply();
  });
  
  socket.on('status', function(status) {
    $scope.status = status;
    $scope.$apply();
  });

  onFix( function(latlng) {
    $scope.latlng = latlng;
    $scope.checkPosition();
  });

}]); /*- end controller -*/

app.factory('onFix', [ '$timeout', function($timeout) {
  
  var listeners = [];
  var listenersOneTime = [];
  var latlng;
  
  if (navigator.geolocation) {
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
        for (var i in listenersOneTime) {
          listenersOneTime[i](latlng);
        }
        listenersOneTime = [];
      }
    };
  
    navigator.geolocation.getCurrentPosition(function(position) {
      updatePos(position);
      navigator.geolocation.watchPosition(updatePos);
    });

    return function(listener, oneTime) {
      if( oneTime === true ) 
        listenersOneTime.push(listener);
      else 
        listeners.push(listener);
    }
  }
}]);


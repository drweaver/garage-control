var geodist = require('geodist');

//TODO make this easier to configure
var authDist = 3; // Miles
var garagePos;

if( process.env.LATLNG ) {
  garagePos = process.env.LATLNG.split(",");
  console.log('Position authorisation in effect lat,lng=' + garagePos);
} else {
  console.log('Position authoirsation is NOT in effect, set with: export LATLNG="mylat,mylng"');
}

exports.init = function(opts) {
  if( opts.distance ) {
    authDist = opts.distance;
    console.log('Authorised distance='+authDist+' miles');
  }
  if( opts.lat && opts.lng ) {
    garagePos = [ opts.lat, opts.lng ];
    console.log('Position authorisation in effect lat,lng=' + garagePos);
  }
}

exports.authorised = function(pos) {
  if( garagePos !== undefined ) {
    if( !pos || typeof pos != 'object' || Object.keys(pos).length != 2 || !pos.lat || !pos.lng || typeof pos.lat != 'number' || typeof pos.lng != 'number' ) {
      console.log('position validation failed: '+pos);
      return false;
    }
    var dist = geodist( garagePos, pos )
    console.log('distance = ' + dist);
    if( dist > authDist ) {
      return false;
    } 
  }
  return true;
}
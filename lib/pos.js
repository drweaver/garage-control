var geodist = require('geodist');

var authDist = 3; // Miles

if( process.env.LATLNG ) {
  var garagePos = process.env.LATLNG.split(",");
  console.log('Position authorisation in effect radius='+authDist+'miles lat,lng=' + garagePos);
} else {
  console.log('Position authoirsation is NOT in effect, set with: export LATLNG="mylat,mylng"');
}

exports.authorised = function(pos) {
  if( garagePos ) {
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
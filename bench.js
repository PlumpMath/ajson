var AJSON   = require('./');
var async   = require('async');
var blocked = require('blocked');

var loopBlockedFor = 0;
blocked(function(ms) {
  loopBlockedFor += ms;
});

var timePerTest = 2 * 1000;
var seconds     = (timePerTest / 1000);

var dataToParse = "{\"a\":\"b\",\"c\":\"d\"}";

function testJsonParse(cb) {
  loopBlockedFor = 0;

  var now = +new Date();
  var i = 0;
  while (true) {
    var parsed = JSON.parse(dataToParse);
    i++;

    var now2 = +new Date();

    if (now2 - now > timePerTest) {
      break;
    }
  }
  var end = +new Date();
  loopBlockedFor = end - now;

  cb(null, i);
}

function testAjsonParse(cb) {
  loopBlockedFor = 0;

  var now = +new Date();
  var i   = 0;

  async.whilst(
    function() {
      var now2 = +new Date();
      return now2 - now <= timePerTest;
    },
    function (callback) {
      AJSON.parse(dataToParse, function(err, parsed) {
        i++;
        callback();
      });
    },
    function (err) {
      cb(null, i);
    }
  );
}

async.series(
  [
    function(callback) {
      console.log('Running JSON.parse benchmark');
      testJsonParse(function(err, howMany) {
        if (err) {
          throw err;
        }

        console.log(howMany + ' JSON.parse()s in ' + seconds + 's, ' + (loopBlockedFor / 1000) + 's event loop blocked');
        callback();
      });
    },
    function(callback) {
      console.log('Running AJSON.parse benchmark');
      testAjsonParse(function(err, howMany) {
        if (err) {
          throw err;
        }

        console.log(howMany + ' AJSON.parse()s in ' + seconds + 's, ' + (loopBlockedFor / 1000) + 's event loop blocked');
        callback();
      });
    },
  ], function(err) {
    console.log('All done!');
  }
);

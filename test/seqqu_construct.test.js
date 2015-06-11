/**
 *
 * Created by harukao on 2015/06/11.
 */
var seqqu = require("../lib/index");

exports.test_Map = function (t) {

  var arr = [0, 2, 3, 4, 6, 10],
      end = arr.length - 1,
      seq = seqqu.Map(arr, function (value, resolve, reject) {

        if (arr.indexOf(value) !== -1) {
          resolve(value * 10);
        } else {
          reject(value);
        }
      });

  seq.forEach(function (v, i) {

    console.log("[test_Map] index: ", i, " value: ", v);

    if (i == end) {
      t.done();
    }
  }, function(err) {
    console.log("Error: ", err);
  });
};

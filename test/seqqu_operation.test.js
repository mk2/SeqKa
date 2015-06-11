/**
 *
 * Created by harukao on 2015/06/11.
 */
var seqqu = require("../index");

exports.test_forEach = function (t) {

  var k   = 1000,
      seq = seqqu.Seq(0, function (v) { return v + k;});

  console.log("Run first forEach");

  seq.forEach(function (v, i) {

    console.log("[forEach] index: ", i, " value: ", v);

    t.equal(v, i * k);

    if (i == 10) {
      return seqqu.fin;
    }
  });

  t.done();
};

exports.test_reduce = function (t) {

  var k   = 1000,
      seq = seqqu.Seq(0, function (v) { return v + k;});

  console.log("Run first reduce");

  seq.reduce(function (carried, v, i) {

    console.log("[reduce] index: ", i, " carried: ", carried);

    if (i < 10) {
      return carried.concat(v);
    }

    return seqqu.fin;

  }, []);

  t.done();
};

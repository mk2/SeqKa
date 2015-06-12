/**
 *
 * Created by harukao on 2015/06/11.
 */
var seqqu = require("..");

exports.test_forEach_1 = function (t) {

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

exports.test_reduce_1 = function (t) {

  var k   = 1000,
      seq = seqqu.Seq(0, function (v) { return v + k;});

  seq.reduce(function (carried, v, i) {

    console.log("[reduce_1] index: ", i, " carried: ", carried);

    if (i < 10) {
      return carried.concat(v);
    }

    return seqqu.fin;

  }, []);

  t.done();
};

exports.test_reduce_2 = function (t) {

  var k   = 1,
      seq = seqqu.Seq(0, function (v) { return v + k;});

  seq.reduce(function (carried, v, i) {

    console.log("[reduce_2] index: ", i, " carried: ", carried);

    if (i < 6) {
      return carried.concat(v);
    }

    return seqqu.fin;

  }, [], function (reduced) {

    t.deepEqual(reduced, [0, 1, 2, 3, 4, 5]);
    t.done();
  });
};

exports.test_reducing_1 = function (t) {

  var k   = 1,
      seq = seqqu.Seq(0, function (v) { return v + k;});

  seq.reducing(function (carried, v, i) {

    console.log("[reducing_1] index: ", i, " carried: ", carried);

    if (i < 6) {
      return carried.concat(v);
    }

    return seqqu.fin;

  }, []).then(function (result) {

    t.deepEqual(result, [0, 1, 2, 3, 4, 5]);
    t.done();
  });
};
/**
 * Library for putting everything into sequence.
 *
 * Support sequence operations:
 * - forEach
 * - slice
 * - map
 *
 * Created by harukao on 2015/06/11.
 */
var seqqu = module.exports = function (initParam, mutatingCb, paramCallingCb) {

  this.callParam      = initParam;
  this.mutatingCb     = mutatingCb;
  this.paramCallingCb = paramCallingCb;
};

/**
 * タイムアウト時間
 * @type {number}
 */
seqqu.prototype.timeout = 1000;

/**
 * シーケンスを１個ずつ読み込んでいく
 * @param cb
 */
seqqu.prototype.forEach = function (cb) {

  this._forEach(cb, 0);
};

seqqu.prototype._forEach = function (_cb, _i, _next) {

  var self = this,
      cb   = _cb,
      i    = _i,
      next = _next || self.next();

  next.then(function (value) {

    var result = cb(value, i, next);

    if (typeof result !== "undefined" && result === false) {
      return Promise.reject(result);
    }

    setTimeout(function () {
      self._forEach(cb, ++i);
    }, 0);

  }).catch(function (err) {

    console.log("Finish: ", err);

  });
};

/**
 * 初期値のタイプがシーケンスのタイプと同じになるようなものをseq化
 *
 * @param initParam
 * @param itrCb
 * @returns {Function}
 * @constructor
 */
seqqu.Seq = function (initParam, itrCb) {

  return new seqqu(
    initParam,
    itrCb,
    function (param, resolve, reject) {
      if (typeof param === "undefined" || param == null) {
        reject(param);
      }
      resolve(param);
    }
  );
};

/**
 * 次の要素を取得するためのプロミスを返す
 *
 * @returns {Promise}
 */
seqqu.prototype.next = function () {
  var self        = this,
      willTimeout = new Promise(function (resolve, reject) {
        setTimeout(reject, self.timeout);
      });

  return Promise.race([self._willNext(), willTimeout]);
};

/**
 * 実際に次の要素を計算する
 *
 * @returns {Promise}
 * @private
 */
seqqu.prototype._willNext = function () {

  var self = this;

  return new Promise(function (resolve, reject) {

    self.paramCallingCb(self.callParam, resolve, reject);
    self.callParam = self.mutatingCb(self.callParam);
  });
};


/**
 * Library for putting everything into sequence.
 *
 * Support sequence operations:
 * - forEach
 * - reduce
 * - slice
 * - map
 *
 * Created by harukao on 2015/06/11.
 */
var seqqu = module.exports = function (initParam, paramMutatingCb, paramCallingCb) {

  this.callParam       = initParam;
  this.paramMutatingCb = paramMutatingCb;
  this.paramCallingCb  = paramCallingCb;
  this.timeout         = 1000;
};

var fin   = void 0;
seqqu.fin = {fin: fin};

//
// seqqu operation - forEach
//

/**
 * シーケンスを１個ずつ読み込んでいく
 * @param itrCb
 * @param finCb
 */
seqqu.prototype.forEach = function (itrCb, finCb) {

  this._forEach(itrCb, finCb, 0);
};

seqqu.prototype._forEach = function (itrCb, _finCb, i, _next) {

  var self  = this,
      finCb = _finCb || function () {},
      next  = _next || self.next();

  next.then(function (value) {

    var result = itrCb(value, i, next);

    if (result == seqqu.fin) {
      return Promise.reject(result);
    }

    setTimeout(function () {
      self._forEach(itrCb, finCb, ++i);
    }, 0);

  }).catch(function (err) {

    finCb(err);

  });
};

//
// seqqu operation - reduce
//

/**
 *
 * @param itrCb
 * @param _carried
 * @param finCb
 */
seqqu.prototype.reduce = function (itrCb, _carried, finCb) {

  var self    = this,
      carried = _carried;

  this.forEach(function (v, i) {

    carried = itrCb(carried, v, i, self);

    if (carried == seqqu.fin) {
      return seqqu.fin;
    }

    return carried;

  }, finCb);
};

//
// seqqu operation - slice
//

seqqu.prototype.slice = function (begin, end) {

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
  var self          = this,
      willBeTimeout = new Promise(function (resolve, reject) {
        setTimeout(reject, self.timeout);
      });

  return Promise.race([self._willGetNext(), willBeTimeout]);
};

/**
 * 実際に次の要素を計算する
 *
 * @returns {Promise}
 * @private
 */
seqqu.prototype._willGetNext = function () {

  var self = this;

  return new Promise(function (resolve, reject) {

    self.paramCallingCb(self.callParam, resolve, reject);
    self.callParam = self.paramMutatingCb(self.callParam);
  });
};


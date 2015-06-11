/**
 * Library for putting everything into sequence.
 *
 * Support sequence operations:
 * - forEach
 * - reduce
 * - slice
 *
 * Created by harukao on 2015/06/11.
 */
var seqqu = module.exports = function (initParam, paramMutatingCb, paramCallingCb) {

  this.callParam       = initParam;
  this.paramMutatingCb = paramMutatingCb;
  this.paramCallingCb  = paramCallingCb;
  this.timeout         = 3000;
  this.ignoreReject    = true;
};

/**
 * fin objects to finish seqqu looping
 */
var fin   = void 0;
seqqu.fin = {__fin: fin};

/**
 * seqqu construct wrapper
 *
 * @param initParam
 * @param paramMutatingCb
 * @param paramCallingCb
 * @returns {Function}
 * @constructor
 */
seqqu.New = function (initParam, paramMutatingCb, paramCallingCb) {

  return new seqqu(
    initParam,
    paramMutatingCb,
    paramCallingCb
  );
};

/**
 * Basic Seq builder
 *
 * @param initParam
 * @param itrCb
 * @returns {Function}
 * @constructor
 */
seqqu.Seq = function (initParam, itrCb) {

  return seqqu.New(
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
 * Seq builder from Array
 *
 * @param arr
 * @param mapCb
 * @returns {Function}
 * @constructor
 */
seqqu.Map = function (arr, mapCb) {

  var idx = 0,
      len = arr.length;

  return seqqu.New(
    arr[idx],
    function () {
      if (idx < len) {
        return arr[++idx];
      } else {
        return seqqu.fin;
      }
    },
    mapCb
  );
};


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

    return carried;

  }, finCb);
};

//
// seqqu operation - slice
//

seqqu.prototype.slice = function (begin, end) {

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

  return new Promise(function (resolve, _reject) {

    // if ignore reject is true, reject action won't be caught.
    var reject     = (self.ignoreReject) ? function () {} : _reject;

    self.paramCallingCb(self.callParam, resolve, reject);
    self.callParam = self.paramMutatingCb(self.callParam);

    // if mutating callback returns seqqu.fin, seqqu must exit own loop.
    if (self.callParam == seqqu.fin) {
      reject(self.callParam);
    }
  });
};


/**
 * Library for putting everything into sequence.
 *
 * Support sequence operations:
 * - forEach
 * - reduce
 *
 * Created by harukao on 2015/06/11.
 */
var event = require('events'),
    util  = require('util');

var Seqqu = module.exports = function (initParam, paramMutatingCb, paramCallingCb) {

  event.EventEmitter.call(this);

  this.callParam       = initParam;
  this.paramMutatingCb = paramMutatingCb;
  this.paramCallingCb  = paramCallingCb;
  this.timeout         = 3000;
  this.ignoreReject    = true;
  this.latestResult    = void 0;
  this.itrIdx          = 0;
};

util.inherits(Seqqu, event.EventEmitter);

/**
 * fin objects to finish Seqqu looping
 */
var fin   = void 0;
Seqqu.fin = {__fin: fin};

/**
 * Seqqu construct wrapper
 *
 * @param initParam
 * @param paramMutatingCb
 * @param paramCallingCb
 * @returns {Seqqu}
 * @constructor
 */
Seqqu.New = function (initParam, paramMutatingCb, paramCallingCb) {

  return new Seqqu(
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
 * @returns {Seqqu}
 * @constructor
 */
Seqqu.Seq = function (initParam, itrCb) {

  return Seqqu.New(
    initParam,
    itrCb,
    function (param, resolve, reject) {
      if (typeof param === 'undefined' || param == null) {
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
 * @returns {Seqqu}
 * @constructor
 */
Seqqu.Map = function (arr, mapCb) {

  var idx = 0,
      len = arr.length;

  return Seqqu.New(
    arr[idx],
    function () {
      if (idx < len) {
        return arr[++idx];
      } else {
        return Seqqu.fin;
      }
    },
    mapCb
  );
};


/**
 * @callback Seqqu~finishCallback
 * @param {(Object | undefined)} error
 */

/**
 * @callback Seqqu~forEachItrCallback
 * @param {*} value
 * @param {number} index
 * @param {Seqqu} Seqqu sequence body
 */

/**
 * Seqqu operation - forEach
 *
 * @desc Iterating sequence with the callback.
 *
 * @param {Seqqu~forEachItrCallback} itrCb
 * @param {Seqqu~finishCallback} finCb
 */
Seqqu.prototype.forEach = function (itrCb, finCb) {

  this._forEach(itrCb, finCb, 0);

  return this;
};

Seqqu.prototype._forEach = function (itrCb, _finCb, i, _next) {

  var self  = this,
      finCb = _finCb || function () {},
      next  = _next || self.next();

  next.then(function (value) {

    var result = itrCb(value, i, self);

    if (result == Seqqu.fin) {
      return Promise.reject(Seqqu.fin);
    }

    self.latestResult = result;

    process.nextTick(function () {
      self._forEach(itrCb, finCb, ++i, self.next());
    });

  }).catch(function (err) {

    // if ignoreReject is true, loop will be continued.
    if (err != Seqqu.fin && self.ignoreReject) {
      setTimeout(function () {
        self._forEach(itrCb, finCb, ++i);
      }, 0);
    } else {
      finCb(self.latestResult);
    }
  });
};


/**
 * @callback Seqqu~reduceItrCallback
 * @param {Object} carried object
 * @param {Object} value
 * @param {number} index
 * @param {Seqqu} Seqqu sequence body
 */

/**
 * Seqqu operation - reduce
 *
 * @desc Iterating sequence with carried value.
 *
 * @param {Seqqu~reduceItrCallback} itrCb
 * @param _carried
 * @param {Seqqu~finishCallback} finCb
 * @returns {*}
 */
Seqqu.prototype.reduce = function (itrCb, _carried, finCb) {

  var self    = this,
      carried = _carried; // TODO Set first itrValue here

  this.forEach(function (v, i) {

    carried = itrCb(carried, v, i, self);

    if (carried != Seqqu.fin) {
      self.latestResult = carried;
    }

    return carried;

  }, finCb);

  return this;
};

/**
 * Seqqu promise return operation - reducing
 * Promise returning version of `reduce`
 *
 * @desc Iterating sequence with carried value.
 *
 * @param {Seqqu~reduceItrCallback} itrCb
 * @param carried
 * @returns {*}
 */
Seqqu.prototype.reducing = function (itrCb, carried) {

  var self = this;

  return new Promise(function (resolve, reject) {

    self.reduce(itrCb, carried, function (result) {
      if (result == Seqqu.fin) {
        reject(result);
      }
      resolve(result);
    });
  });
};

/**
 * Returns a raced promise contains next iteration.
 *
 * @private
 *
 * @returns {Promise.<(number|*)>}
 */
Seqqu.prototype.next = function () {
  var self          = this,
      willBeTimeout = new Promise(function (resolve, reject) {
        setTimeout(reject, self.timeout);
      });

  return Promise.race([self._willGetNext(), willBeTimeout]);
};

/**
 * Returns a promise contains next iteration.
 *
 * @private
 *
 * @returns {Promise.<*>}
 */
Seqqu.prototype._willGetNext = function () {

  var self = this;

  // increment itrIdx
  ++self.itrIdx;

  return new Promise(function (resolve, _reject) {

    // if ignore reject is true, reject action won't be caught.
    var reject     = (self.ignoreReject) ? function () {} : _reject;

    self.paramCallingCb(self.callParam, resolve, reject, self);
    self.callParam = self.paramMutatingCb(self.callParam);

    // if mutating callback returns Seqqu.fin, Seqqu exit own loop.
    if (self.callParam == Seqqu.fin) {
      reject(self.callParam);
    }
  });
};


'use strict';
/**
 * Module dependencies.
 */
var Memcached = require('memcached'); 

/**
 * Expose module.
 * @param {Object} Mongoose
 * @param {Object} options for the server such as cache and ttl
 */
module.exports = function mongooseMemcached(mongoose, options) {

  options = options || {};

  // default time to live in seconds
  var TTL = options.ttl || 60,
      CACHED = 'cache' in options ? options.cache : false,
      memServer = options.memServers || 'localhost:11211',
      memOptions = options.memOptions || null,
      Query = mongoose.Query,
      exec = Query.prototype.exec,
      _memcached = new Memcached(memServer, memOptions);

  /**
   * sets the function to generate the key
   * before you call this, make sure the query is a find query
   * @param {Query} query
   */
  function genKey(query) {
    var obj = {};
    obj.model = query.model.modelName;
    obj.options = query.options;
    obj.cond = query._conditions;
    obj.fields = query._fields;
    obj.update = query._update;
    obj.path = query._path;
    obj.distinct = query._distinct;
    return JSON.stringify(obj);
  }

  /**
   * Time to live getter and setter
   * @param {Number} ttl
   * @return {Query|Number}
   * @api public
   */
  Query.prototype.ttl = function(ttl) {
    if(typeof ttl === 'undefined') {
      return this._ttl;
    } else if (typeof ttl === 'number') {
      this._ttl = ttl;
      return this;
    } else {
      throw new Error('TTL, if passed, must be a number!'); 
    } 
  };
  /**
   * Cache enabler and disabler 
   * @param {Boolean} cached
   * @return {Query} this
   * @api public
   */
  Query.prototype.cache = function (cache, ttl) {

    // if you just call this function with no parameter, we are going to
    // assume the user want it cached, with the default ttl 
    if (!arguments.length) {
      this._cache = true;
    } else if ("boolean" === typeof cache) {
      this._cache = cache;
    }

    if ('number' === typeof ttl) {
      this._ttl = ttl;
    } else {
      this._ttl = TTL;
    }

    return this;
  };


  /**
   * Execute query.
   *
   * @param {String|Function} op
   * @param {Function} fn
   * @return {Query} this
   * @api private
   */

  Query.prototype.exec = function (cb) {
    var self = this;
    // initialize the value of _cache if .cache() was never called
    if(typeof self._cache === 'undefined') {
      self._cache = CACHED;
    }
    // only cache find operations
    if (!self._cache || self.op !== 'find') {
      self._dataCached = false;
      return exec.call(self, cb);
    }
   
    var key = genKey(self);
    // check in memcached. If not, then execute the query
    _memcached.get(key, function(e, data) {
      // if it does exist, return the data
      if(e) {
        self._dataCached = false;
        return exec.call(self, e);
      } else if (data) {
        self._dataCached = true;
        return cb(e, data);
      }

      // if it does not exist, set the data after execution finished
      exec.call(self, function(e, data) {
        if(e) {
          return cb(e);
        }
        // if it is not in memcached, set the key and return
        _memcached.set(key, data, self._ttl, function(e, data) {
          if(e) {
            return cb(e);
          } 
          self._dataCached = false;
          return cb(null, data);          
        });
      });
    });
    return this;
  };

  /**
   * Check if results from this query is from cache.
   *
   * @type {Boolean}
   * @api public
   */
  Object.defineProperty(Query.prototype, 'isFromCache', {
    get: function () {
      return !(typeof this._dataCached === 'undefined' || 
        this._dataCached === false);
    }
  });

  /**
   * Check if this query has caching enabled.
   *
   * @type {Boolean}
   * @api public
   */
  Object.defineProperty(Query.prototype, 'isCacheEnabled', {
    get: function () {
      return this._cache;
    }
  });
};

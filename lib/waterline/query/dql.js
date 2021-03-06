/**
 * DQL Queries
 */

var usageError = require('../utils/usageError'),
    utils = require('../utils/helpers'),
    normalize = require('../utils/normalize'),
    _ = require('underscore'),
    async = require('async');

module.exports = {

  /**
   * Join
   *
   * Join with another collection
   * (use optimized join in adapter if one was provided)
   */

  join: function(collection, fk, pk, cb) {

    // Return Deferred or pass to adapter
    if(typeof cb !== 'function') {
      return {}; // Deferred object goes here
    }

    this._adapter.join(collection, fk, pk, cb);
  },

  /**
   * Create a new record
   *
   * @param {Object || Array} values for single model or array of multiple values
   * @param {Function} callback
   * @return Deferred object if no callback
   */

  create: function(values, cb) {
    var self = this;

    // Handle Array of values
    if(Array.isArray(values)) {
      return this.createEach(values, cb);
    }

    // Set Default Values if available
    for(var key in this.attributes) {
      if(!values[key] && this.attributes[key].defaultsTo) {
        values[key] = this.attributes[key].defaultsTo;
      }
    }

    async.series([

      // Run Before Validate Lifecycle Callbacks
      function(cb) {
        var runner = function(item, callback) {
          item.call(values, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.beforeValidation, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Run Validation
      function(cb) {
        self._validator.validate(values, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Run After Validate Lifecycle Callbacks
      function(cb) {
        var runner = function(item, callback) {
          item.call(values, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.afterValidation, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Before Create Lifecycle Callback
      function(cb) {
        var runner = function(item, callback) {
          item.call(values, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.beforeCreate, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      }

    ], function(err) {
      if(err) return cb(err);

      // Automatically add updatedAt and createdAt (if enabled)
      if(self.autoCreatedAt) values.createdAt = new Date();
      if(self.autoUpdatedAt) values.updatedAt = new Date();

      // Return Deferred or pass to adapter
      if(typeof cb !== 'function') {
        return {}; // Deferred object goes here
      }

      // Pass to adapter here
      self._adapter.create(values, function(err, values) {
        if(err) return cb(err);

        var runner = function(item, callback) {
          item.call(values, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        // Run afterCreate Lifecycle Callbacks
        async.eachSeries(self._callbacks.afterCreate, runner, function(err) {
          if(err) return cb(err);

          // Return an instance of Model
          var model = new self._model(values);
          cb(null, model);
        });
      });
    });
  },

  /**
   * Update a new record
   *
   * @param {Object} query keys
   * @param {Object} attributes to update
   * @param {Function} callback
   * @return Deferred object if no callback
   */

  update: function(options, newValues, cb) {
    var self = this;

    if(typeof options === 'function') {
      cb = options;
      options = null;
    }

    var usage = utils.capitalize(this.identity) + '.update(criteria, newValues, callback)';

    if(!newValues) return usageError('No updated values specified!', usage, cb);
    if(typeof cb !== 'function') return usageError('Invalid callback specified!', usage, cb);

    async.series([

      // Run Before Validate Lifecycle Callbacks
      function(cb) {
        var runner = function(item, callback) {
          item.call(newValues, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.beforeValidation, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Run Validation
      function(cb) {
        self._validator.validate(newValues, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Run After Validate Lifecycle Callbacks
      function(cb) {
        var runner = function(item, callback) {
          item.call(newValues, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.afterValidation, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Before Save Lifecycle Callback
      function(cb) {
        var runner = function(item, callback) {
          item.call(newValues, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.beforeSave, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      }

    ], function(err) {
      if(err) return cb(err);

      // Automatically change updatedAt (if enabled)
      if(self.autoUpdatedAt) newValues.updatedAt = new Date();

      // Return Deferred or pass to adapter
      if(typeof cb !== 'function') {
        return {}; // Deferred object goes here
      }

      // Pass to adapter here
      self._adapter.update(options, newValues, function(err, values) {
        if(err) return cb(err);

        var runner = function(item, callback) {
          item.call(values, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        // Run afterSave Lifecycle Callbacks
        async.eachSeries(self._callbacks.afterSave, runner, function(err) {
          if(err) return cb(err);

          // Return an instance of Model
          var model = new self._model(values);
          cb(null, model);
        });
      });
    });
  },

  /**
   * Update all records matching criteria
   *
   * @param {Object} query keys
   * @param {Object} attributes to update
   * @param {Function} callback
   * @return Deferred object if no callback
   */

  updateAll: function(options, newValues, cb) {
    var self = this;

    if(typeof options === 'function') {
      cb = options;
      options = null;
    }

    var usage = utils.capitalize(this.identity) + '.update(criteria, newValues, callback)';

    if(!newValues) return usageError('No updated values specified!', usage, cb);
    if(typeof cb !== 'function') return usageError('Invalid callback specified!', usage, cb);

    async.series([

      // Run Before Validate Lifecycle Callbacks
      function(cb) {
        var runner = function(item, callback) {
          item.call(newValues, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.beforeValidation, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Run Validation
      function(cb) {
        self._validator.validate(newValues, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Run After Validate Lifecycle Callbacks
      function(cb) {
        var runner = function(item, callback) {
          item.call(newValues, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.afterValidation, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      },

      // Before Save Lifecycle Callback
      function(cb) {
        var runner = function(item, callback) {
          item.call(newValues, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        async.eachSeries(self._callbacks.beforeSave, runner, function(err) {
          if(err) return cb(err);
          cb();
        });
      }

    ], function(err) {
      if(err) return cb(err);

      // Automatically change updatedAt (if enabled)
      if(self.autoUpdatedAt) newValues.updatedAt = new Date();

      // Return Deferred or pass to adapter
      if(typeof cb !== 'function') {
        return {}; // Deferred object goes here
      }

      // Pass to adapter
      self._adapter.updateAll(options, newValues, function(err, values) {
        if(err) return cb(err);

        // If values is not an array, return an array
        if(!Array.isArray(values)) values = [values];

        async.each(values, function(record, callback) {

          var runner = function(item, callback) {
            item.call(record, function(err) {
              if(err) return callback(err);
              callback();
            });
          };

          // Run afterSave Lifecycle Callbacks on each record
          async.eachSeries(self._callbacks.afterSave, runner, function(err) {
            if(err) return callback(err);
            callback();
          });

        }, function(err) {
          if(err) return cb(err);

          var models = [];

          // Make each result an instance of model
          values.forEach(function(value) {
            models.push(new self._model(value));
          });

          cb(null, models);
        });
      });
    });
  },

  updateWhere: function() {
    this.updateAll.apply(this, Array.prototype.slice.call(arguments));
  },

  /**
   * Destroy a Record
   *
   * @param {Object} criteria to destroy
   * @param {Function} callback
   * @return Deferred object if no callback
   */

  destroy: function(criteria, cb) {
    var self = this;

    if(typeof criteria === 'function') {
      cb = criteria;
      criteria = {};
    }

    var usage = utils.capitalize(this.identity) + '.destroy([options], callback)';

    // Return Deferred or pass to adapter
    if(typeof cb !== 'function') {
      return {}; // Deferred object goes here
    }

    var runner = function(item, callback) {
      item.call(criteria, function(err) {
        if(err) return callback(err);
        callback();
      });
    };

    // Run beforeDestroy Lifecycle Callback
    async.eachSeries(this._callbacks.beforeDestroy, runner, function(err) {
      if(err) return cb(err);

      // Pass to adapter
      self._adapter.destroy(criteria, function(err, result) {
        var runner = function(item, callback) {
          item.call(result, function(err) {
            if(err) return callback(err);
            callback();
          });
        };

        // Run afterDestroy Lifecycle Callback
        async.eachSeries(self._callbacks.afterDestroy, runner, function(err) {
          if(err) return cb(err);
          cb(null, result);
        });
      });
    });
  },

  destroyWhere: function() {
    return this.destroy.apply(this, Array.prototype.slice.call(arguments));
  },

  destroyAll: function() {
    return this.destroy.apply(this, Array.prototype.slice.call(arguments));
  },

  /**
   * Count of Records
   *
   * @param {Object} criteria
   * @param {Object} options
   * @param {Function} callback
   * @return Deferred object if no callback
   */

  count: function(criteria, options, cb) {
    var usage = utils.capitalize(this.identity) + '.count([criteria],[options],callback)';

    if(typeof criteria === 'function') {
      cb = criteria;
      criteria = null;
      options = null;
    }

    if(typeof options === 'function') {
      cb = options;
      options = null;
    }

    // Normalize criteria and fold in options
    criteria = normalize.criteria(criteria);

    if(_.isObject(options) && _.isObject(criteria)) {
      criteria = _.extend({}, criteria, options);
    }

    if(_.isFunction(criteria) || _.isFunction(options)) {
      return usageError('Invalid options specified!', usage, cb);
    }

    // Return Deferred or pass to adapter
    if(typeof cb !== 'function') {
      return {}; // Deferred object goes here
    }

    // Build model(s) from result set
    this._adapter.count(criteria, cb);
  }

};

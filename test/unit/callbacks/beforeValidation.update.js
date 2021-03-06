var Collection = require('../../../lib/waterline/collection'),
    assert = require('assert');

describe('.beforeValidation()', function() {
  var person;

  before(function(done) {
    var Model = Collection.extend({
      identity: 'user',
      adapter: 'foo',
      attributes: {
        name: 'string'
      },

      beforeValidation: function(cb) {
        this.name = this.name + ' updated';
        cb();
      }
    });

    // Fixture Adapter Def
    var adapterDef = { update: function(col, criteria, values, cb) { return cb(null, [values]); }};
    new Model({ adapters: { foo: adapterDef }}, function(err, coll) {
      if(err) done(err);
      person = coll;
      done();
    });
  });

  /**
   * Update
   */

  describe('.update()', function() {

    it('should run beforeValidation and mutate values', function(done) {
      person.update({ name: 'criteria' }, { name: 'test' }, function(err, user) {
        assert(!err);
        assert(user.name === 'test updated');
        done();
      });
    });
  });

});

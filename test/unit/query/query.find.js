var Collection = require('../../../lib/waterline/collection'),
    assert = require('assert');

describe('Collection Query', function() {

  describe('.find()', function() {
    var query;

    before(function(done) {

      // Extend for testing purposes
      var Model = Collection.extend({
        identity: 'user',
        adapter: 'foo',
        attributes: {
          name: {
            type: 'string',
            defaultsTo: 'Foo Bar'
          },
          doSomething: function() {}
        }
      });

      // Fixture Adapter Def
      var adapterDef = { find: function(col, criteria, cb) { return cb(null, [{name: 'Foo Bar'}]); }};
      new Model({ adapters: { foo: adapterDef }}, function(err, coll) {
        if(err) done(err);
        query = coll;
        done();
      });
    });

    it('should return an instance of Model', function(done) {
      query.find({}, function(err, values) {
        assert(typeof values.doSomething === 'function');
        done();
      });
    });

  });
});

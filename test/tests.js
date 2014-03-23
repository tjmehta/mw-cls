var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var request = require('supertest');
var cls = require('../index');

describe('run, set and send', function() {
  describe('key', function() {
    before(function () {
      var session = cls.createNamespaceMiddleware('session');
      this.app = createAppWithMiddleware(
        session.run(),
        session.set('key', 'val'),
        session.send('key')
      );
    });
    it('should set a key', function(done) {
      request(this.app)
        .get('/')
        .expect(200, 'val')
        .end(done);
    });
  });
  describe('keypath', function() {
    before(function () {
      var session = cls.createNamespaceMiddleware('session');
      this.app = createAppWithMiddleware(
        session.run(),
        session.set('key.val.yo', 'val'),
        session.send(201, 'key.val.yo')
      );
    });
    it('should set a keypath', function(done) {
      request(this.app)
        .get('/')
        .expect(201, 'val')
        .end(done);
    });
  });
});

describe('run, setAsync and send', function() {
  describe('key', function() {
    before(function () {
      var session = cls.createNamespaceMiddleware('session');
      this.app = createAppWithMiddleware(
        session.run(),
        session.asyncSet('key', asyncVal),
        session.send('key')
      );
    });
    it('should set a key', function(done) {
      request(this.app)
        .get('/')
        .expect(200, 'val')
        .end(done);
    });
  });
  describe('keypath', function() {
    before(function () {
      var session = cls.createNamespaceMiddleware('session');
      this.app = createAppWithMiddleware(
        session.run(),
        session.asyncSet('key.val.yo', asyncVal),
        session.send(201, 'key.val.yo')
      );
    });
    it('should set a keypath', function(done) {
      request(this.app)
        .get('/')
        .expect(201, 'val')
        .end(done);
    });
  });
  describe('include error / multi vals', function() {
    before(function () {
      var session = cls.createNamespaceMiddleware('session');
      this.app = createAppWithMiddleware(
        session.run(),
        session.asyncSet('key', asyncVal, {includeError:true}),
        session.send('key')
      );
    });
    it('should set a key', function(done) {
      request(this.app)
        .get('/')
        .expect(200, [null, 'val'])
        .end(done);
    });
  });
  function asyncVal (cb) {
    setTimeout(function () {
      cb(null, 'val');
    }, 0);
  }
});

describe('createNamespaceMiddleware and getNamespaceMiddleware', function() {
  it('should create and get same namespace', function() {
    cls.createNamespaceMiddleware('session').namespace
      .should.equal(cls.getNamespaceMiddleware('session').namespace);
  });
});
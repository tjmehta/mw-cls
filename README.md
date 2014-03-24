mw-cls [![Build Status](https://travis-ci.org/tjmehta/mw-cls.png)](https://travis-ci.org/tjmehta/mw-cls)
======

Advanced CLS (continuation local storage) middleware (for express, restify, ...)

## Namespace middleware

### mwCLS.createNamespaceMiddleware(name)

```js
var session = mwCLS.createNamespaceMiddleware('session');
```

### namespace.run()

run the following middleware within the namespace

```js
var mwCLS = require('mw-cls');
var session = mwCLS.createNamespaceMiddleware('session');

app.use(session.run());
```

### namespace.set(keypath, val)
### namespace.set(keypath, val, force)

* set the namespace keypath with a value
* defaults: force = true
* force - force creates the keypathpath if it DNE

```js
var mwCLS = require('mw-cls');
var session = mwCLS.createNamespaceMiddleware('session');

app.use(session.run()); // must be first
app.get('/',
  session.set('foo.bar.baz', 'value'), ...);
  // cls.getNamespace('session').get('foo').bar.baz becomes 'value'
```

### namespace.asyncSet(keypath, val)
### namespace.asyncSet(keypath, val, opts)

* set the namespace keypath as the result of an async function
* defaults: opts = { force: true, includeError: false }
* force - force creates the keypathpath if it DNE
* includeError - specify whether to ignore/include the error arg


```js
var mwCLS = require('mw-cls');
var session = mwCLS.createNamespaceMiddleware('session');
function asyncValue (cb) {
  setTimeout(function () {
    cb(null, 'value');
  }, 100);
}

app.use(session.run()); // must be first
app.get('/',
  session.asyncSet('foo.bar.baz', asyncValue), ...);
  // cls.getNamespace('session').get('foo').bar.baz becomes 'value'

```

includeError option
```js
var mwCLS = require('mw-cls');
var session = mwCLS.createNamespaceMiddleware('session');
function asyncValue (cb) {
  setTimeout(function () {
    cb(null, 'value');
  }, 100);
}

app.use(session.run()); // must be first
var opts =  { includeError:true };
app.get('/',
  session.asyncSet('foo', asyncValue, opts), ...);
  // cls.getNamespace('session').get('foo') becomes [null, 'value']

```

### namespace.send(keypath)
### namespace.send(code, keypath)

* res.send the value for the namespace keypath
* defaults: code = 200

```js
var mwCLS = require('mw-cls');
var session = mwCLS.createNamespaceMiddleware('session');

app.use(session.run()); // must be first
app.get('/',
  session.set('foo.bar.baz', 'value'),
  session.send('foo.bar.baz'));
  // session.get('foo').bar.baz becomes 'value'
  // res.sends 'value', code defaults to 200
```

### namespace.json(keypath)
### namespace.json(code, keypath)

* res.json the value for the namespace key
* defaults: code = 200

```js
var mwCLS = require('mw-cls');
var session = mwCLS.createNamespaceMiddleware('session');

app.use(session.run()); // must be first
app.get('/',
  session.set('foo.bar.baz', 'value'),
  session.json('foo.bar'));
  // session.get('foo').bar.baz becomes 'value'
  // res.sends { bar: 'value' }, code defaults to 200
```

### TODO methods
mv, cp, del, unset, setFromReq

## License

MIT
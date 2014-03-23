mw-cls [![Build Status](https://travis-ci.org/tjmehta/mw-cls.png)](https://travis-ci.org/tjmehta/mw-cls)
======

Advanced CLS (continuation local storage) middleware (for express, restify, ...)

# Namespace middleware

```js
var session = cls.createNamespaceMiddleware('session');
```

## .run()

run the following middleware within the namespace

```js
var cls = require('mw-cls');
var session = cls.createNamespaceMiddleware('session');

app.use(session.run());
```

## .set(key, val [, forceCreateKeypath=true])

set the namespace key with a value

```js
var cls = require('mw-cls');
var session = cls.createNamespaceMiddleware('session');

app.use(session.run()); # required
app.get('/',
  session.set('foo.bar.baz', 'value'),
  ...);
```

## .asyncSet(key, val [, opts={forceCreateKeypath:true, includeError:false}])

set the namespace key as the result of an async function

```js
var cls = require('mw-cls');
var session = cls.createNamespaceMiddleware('session');

app.use(session.run()); # required
app.get('/',
  session.asyncSet('foo.bar.baz', asyncValue), // session.get('foo').bar.baz becomes 'value'
  ...);

function asyncValue (cb) {
  setTimeout(function () {
    cb(null, 'value');
  }, 100);
}
```

includeError option
```js
var cls = require('mw-cls');
var session = cls.createNamespaceMiddleware('session');

app.use(session.run()); # required
app.get('/',
  session.asyncSet('foo.bar.baz', asyncValue, { includeError:true }), // session.get('foo').bar.baz becomes [null, 'value']
  ...);

function asyncValue (cb) {
  setTimeout(function () {
    cb(null, 'value');
  }, 100);
}
```

## .send([code, ]key [, forceReturnKeypath=true]) // forceReturnKeypath means no errors if keypath DNE

res.send the value for the namespace key

```js
var cls = require('mw-cls');
var session = cls.createNamespaceMiddleware('session');

app.use(session.run()); # required
app.get('/',
  session.set('foo.bar.baz', 'value'), // session.get('foo').bar.baz becomes 'value'
  session.send('foo.bar.baz')); // res.sends 'value', code defaults to 200
```

## .json([code, ]key [, forceReturnKeypath=true]) // forceReturnKeypath means no errors if keypath DNE

res.json the value for the namespace key

```js
var cls = require('mw-cls');
var session = cls.createNamespaceMiddleware('session');

app.use(session.run()); # required
app.get('/',
  session.set('foo.bar.baz', 'value'), // session.get('foo').bar.baz becomes 'value'
  session.json('foo.bar')); // res.sends { bar: 'value' }, code defaults to 200
```

## TODO
mv, cp, del, unset, setFromReq

## License

MIT
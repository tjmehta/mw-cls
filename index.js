var Keypather = require('keypather');
var cls = require('continuation-local-storage');
var matches = require('map-utils').matches;
var exists = require('map-utils').exists;

var middleware = module.exports = {};

middleware.cls = cls;

middleware.createNamespaceMiddleware = function (name) {
  var ns = cls.createNamespace(name);
  return middleware.getNamespaceMiddleware(ns);
};

// nameOrNamespace
middleware.getNamespaceMiddleware = function (name) {
  var ns = (typeof name === 'string') ? cls.getNamespace(name) : name;
  var boundMethods = {};
  Object.keys(middleware)
    .filter(matches(/^ns/))
    .forEach(function (methodName) {
      var shortName = uncapitalize(methodName.replace('ns', ''));
      boundMethods[shortName] = middleware[methodName].bind(middleware, ns);
    });
  boundMethods.run = middleware.runWith.bind(middleware, ns);
  boundMethods.namespace = ns;

  return boundMethods;
};

// namespace
middleware.runWith = function (ns) {
  if (!ns) throw new Error('namespace is required');
  return function (req, res, next) {
    ns.bindEmitter(req);
    ns.bindEmitter(res);

    ns.run(function () {
      next();
    });
  };
};

// nameOrNamespace, key, val
middleware.nsSet = function (name, keypath, val, force) {
  var isKeypath = checkIsKeypath(keypath);
  force = exists(force) ? force : true; // force default: true
  var keypather = Keypather({ force: force });
  var key;
  if (isKeypath) {
    var split = splitKeypathFirstAndRest(keypath);
    key = split.first;
    keypath = split.rest;
  }
  else {
    key = keypath;
  }
  return function (req, res, next) {
    var ns = (typeof name === 'string') ? cls.getNamespace(name) : name;
    if (isKeypath) {
      var obj = ns.get(key);
      if (!obj && force) {
        obj = {};
        ns.set(key, obj);
      }
      keypather.set(obj, keypath, val);
    }
    else {
      ns.set(key, val);
    }
    next();
  };
};

// nameOrNamespace, keypath, fn, opts{force, includeError}
middleware.nsAsyncSet = function (name, keypath, fn, opts) {
  opts = opts || {};
  opts.force = exists(opts.force) ? opts.force : true; // opts.force default: true
  var keypather = Keypather(opts);
  var isKeypath = checkIsKeypath(keypath);
  var key;
  if (isKeypath) {
    var split = splitKeypathFirstAndRest(keypath);
    key = split.first;
    keypath = split.rest;
  }
  else {
    key = keypath;
  }
  return function (req, res, next) {
    fn(function (err /*, vals */) {
      var sliceIndex = opts.includeError ? 0 : 1;
      var vals = Array.prototype.slice.call(arguments, sliceIndex);
      if (vals.length === 1) {
        vals = vals[0];
      }
      var ns = (typeof name === 'string') ? cls.getNamespace(name) : name;

      if (isKeypath) {
        var obj = ns.get(key);
        if (!obj && opts.force) {
          obj = {};
          ns.set(key, obj);
        }
        keypather.set(obj, keypath, vals);
      }
      else {
        ns.set(key, vals);
      }
      next();
    });
  };
};

// name, [code, ] keypath
middleware.nsSend = function (name, code, keypath, force) {
  force = exists(force) ? force : true; // force default: true
  var keypather = Keypather({ force:force });
  if (typeof code === 'string') {
    keypath = code;
    code = null;
  }
  code = code || 200; // default code: 200
  var isKeypath = checkIsKeypath(keypath);
  var key;
  if (isKeypath) {
    var split = splitKeypathFirstAndRest(keypath);
    key = split.first;
    keypath = split.rest;
  }
  else {
    key = keypath;
  }
  return function (req, res, next) {
    var ns = (typeof name === 'string') ? cls.getNamespace(name) : name;
    var val;
    if (isKeypath) {
      var obj = ns.get(key);
      val = keypather.get(obj, keypath);
    }
    else {
      val = ns.get(key, val);
    }
    res.send(code, val);
  };
};

// name, [code, ] keypath
middleware.nsJson = function (name, code, keypath, force) {
  force = exists(force) ? force : true; // force default: true
  var keypather = Keypather({ force:force });
  if (typeof code === 'string') {
    keypath = code;
    code = null;
  }
  code = code || 200; // default code: 200
  var isKeypath = checkIsKeypath(keypath);
  var key;
  if (isKeypath) {
    var split = splitKeypathFirstAndRest(keypath);
    key = split.first;
    keypath = split.rest;
  }
  else {
    key = keypath;
  }
  return function (req, res, next) {
    var ns = (typeof name === 'string') ? cls.getNamespace(name) : name;
    var val;
    if (isKeypath) {
      var obj = ns.get(key);
      val = keypather.get(obj, keypath);
    }
    else {
      val = ns.get(key, val);
    }
    res.json(code, val);
  };
};

function checkIsKeypath (keypath) {
  return ~keypath.indexOf('.') || (~keypath.indexOf('[') && ~keypath.indexOf(']'));
}

function splitKeypathFirstAndRest (keypath) {
  var indexOfBracket = keypath.indexOf('[');
  var indexOfDot = keypath.indexOf('.');
  var keypathHasDot = ~indexOfDot;
  var keypathHasBrackets = ~indexOfBracket && ~keypath.indexOf(']');

  var splitChar = keypathHasDot && keypathHasBrackets ?
    (indexOfDot < indexOfBracket ? '.' : '[') :
    (keypathHasDot ? '.' : '['); // only has dot or bracket

  var split = keypath.split(splitChar);
  var first = split.shift();
  var rest = split.join(splitChar);
  if (splitChar === '[') rest = '[' + rest;

  return {
    first: first,
    rest: rest
  };
}

function uncapitalize (str) {
  return str[0].toLowerCase() + str.slice(1);
}
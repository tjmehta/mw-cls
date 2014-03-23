var express = require('express');

module.exports = function createAppWithMiddlewares (/* middlewares */) {
  var middlewares = Array.prototype.slice.call(arguments);
  var app = express();
  app.use(express.json());
  app.use(express.urlencoded());
  middlewares.forEach(function (middleware) {
    app.use(middleware);
  });
  app.use(app.router);
  app.use(errorHandler);
  app.all('/', sendBody);
  return app;
};

function errorHandler (err, req, res, next) {
  res.json(500, {
    message: err.message
  });
}
function sendBody (req, res, next) {
  res.json(req.body);
}
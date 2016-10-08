/**
 * Created by nuintun on 2016/9/27.
 */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('./lib/util');
const methods = require('methods');
const Router = require('koa-router');
const routes = Router.prototype.routes;

// end of line
const EOL = os.EOL;
// module not found
const MODULE_NOT_FOUND = 'MODULE_NOT_FOUND';

/**
 * Interceptors
 * @param router_base
 * @param controller_base
 * @param options
 * @returns {Router}
 * @constructor
 */
function Interceptors(router_base, controller_base, options){
  var ctx = this;

  if (!(ctx instanceof Interceptors)) {
    return new Interceptors(router_base, controller_base, options);
  }

  if (!router_base || !util.string(router_base)) {
    router_base = '/routers';
  }

  if (!controller_base || !util.string(controller_base)) {
    controller_base = '/controllers';
  }

  // super
  Router.call(ctx, options);

  // set prop
  ctx.router_set = [];
  ctx.router_base = util.realpath(router_base);
  ctx.controller_base = util.realpath(controller_base);

  // call invoke
  ctx.invoke(ctx.router_base);
}

/**
 * extend
 * @type {Router}
 */
Interceptors.prototype = Object.create(Router.prototype, {
  constructor: { value: Interceptors }
});

/**
 * invoke controller
 * @param dir
 * @returns {Router}
 */
Interceptors.prototype.invoke = function (dir){
  var ctx = this;

  fs
    .readdirSync(dir)
    .forEach(function (filename){
      var router_src = util.src4router(filename, dir);
      var stats = fs.statSync(router_src);

      // dir
      if (stats.isDirectory()) {
        ctx.invoke(router_src);
      } else {
        var ext = path
          .extname(router_src)
          .toLowerCase();

        if (ext === '.js') {
          var routes = require(router_src);
          var router_path = util.path2cwd(router_src);
          var controller_src = util.src4controller(router_src, ctx.router_base, ctx.controller_base);

          // assert routes
          if (util.object(routes)) {
            var controller_path = util.path2cwd(controller_src);

            // load controller
            try {
              var controller = require(controller_src);
            } catch (error) {
              if (error.code === MODULE_NOT_FOUND) {
                throw new Error(`Controller: ${controller_path} not found!`);
              } else {
                throw new Error(`Controller: ${controller_path} error occurred!${EOL}  ${error}`);
              }
            }

            // assert controller
            if (util.object(controller)) {
              Object.keys(routes).forEach(function (url){
                var route = routes[url];

                // assert route
                if (util.array(route)) {
                  route.forEach(function (item){
                    var action_name = item.action;
                    var action = controller[action_name];

                    // assert action
                    if (action) {
                      var method_lower;
                      var method = route.hasOwnProperty('method')
                        ? route.method : 'get';

                      // assert method
                      if (util.string(method)
                        && methods.indexOf(method_lower = method.toLowerCase()) !== -1) {
                        // set auto router data
                        ctx[method_lower](url, function (ctx, next){
                          var routeData = ctx.routeData || {};

                          routeData.action = action_name;
                          routeData.router = router_path;
                          routeData.controller = controller_path;

                          ctx.routeData = routeData;

                          return next();
                        });

                        // cache router
                        ctx.router_set.push({
                          url: url,
                          action: action,
                          method: method_lower
                        });
                      } else {
                        throw new TypeError(`Method: ${method} not support!`);
                      }
                    } else {
                      throw new Error(`Action: ${action_name} can't be found in controller: ${controller_path}!`);
                    }
                  });
                } else {
                  throw new TypeError(`Route: ${url} invalid!`);
                }
              });
            } else {
              throw new TypeError(`Controller: ${controller_path} invalid!`)
            }
          } else {
            throw new TypeError(`Router: ${router_path} invalid!`);
          }
        }
      }
    });

  return ctx;
};

/**
 * returns router middleware which dispatches a route matching the request
 * @returns {Function}
 */
Interceptors.prototype.routes = function (){
  var ctx = this;

  // add router
  ctx.router_set.forEach(function (item){
    ctx[item.method](item.url, item.action);
  });

  return routes.apply(ctx, arguments);
};

/**
 * generate URL from url pattern and given `params`
 *
 * @example
 *
 * ```javascript
 * var url = Interceptors.url('/users/:id', {id: 1});
 * // => "/users/1"
 * ```
 *
 * @param {String} path url pattern
 * @param {Object} params url parameters
 * @returns {String}
 */
Interceptors.url = Router.url;

// exports
module.exports = Interceptors;

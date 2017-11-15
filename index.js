/**
 * @module index
 * @license MIT
 * @version 2017/11/15
 */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const methods = require('methods');
const utils = require('./lib/utils');
const Router = require('koa-router');

// Module not found
const MODULE_NOT_FOUND = 'MODULE_NOT_FOUND';

/**
 * @class Interceptors
 */
class Interceptors extends Router {
  /**
   * @constructor
   * @param {string} router_base
   * @param {string} controller_base
   * @param {Object} options
   */
  constructor(router_base, controller_base, options) {
    if (!(this instanceof Interceptors)) {
      return new Interceptors(router_base, controller_base, options);
    }

    if (!router_base || !utils.string(router_base)) {
      router_base = '/routers';
    }

    if (!controller_base || !utils.string(controller_base)) {
      controller_base = '/controllers';
    }

    // Call super
    super(options);

    // Set prop
    this.router_set = [];
    this.router_base = utils.realpath(router_base);
    this.controller_base = utils.realpath(controller_base);

    // Call invoke
    this.invoke(this.router_base);
  }

  /**
   * @method invoke
   * @param {string} dir
   */
  invoke(dir) {
    fs.readdirSync(dir)
      .forEach((filename) => {
        const router_src = util.src4router(filename, dir);
        const stats = fs.statSync(router_src);

        // Is dir
        if (stats.isDirectory()) {
          this.invoke(router_src);
        } else {
          const ext = path.extname(router_src).toLowerCase();

          if (ext === '.js') {
            const routes = require(router_src);
            const router_path = util.path2cwd(router_src);
            const controller_src = util.src4controller(router_src, this.router_base, this.controller_base);

            // Assert routes
            if (util.object(routes)) {
              let controller;
              const controller_path = util.path2cwd(controller_src);

              // Load controller
              try {
                controller = require(controller_src);
              } catch (error) {
                if (error.code === MODULE_NOT_FOUND) {
                  throw new Error(`Controller: ${ controller_path } not found!`);
                } else {
                  throw new Error(`Controller: ${ controller_path } error occurred!\n  ${ error }`);
                }
              }

              // Assert controller
              if (util.object(controller)) {
                Object.keys(routes).forEach((url) => {
                  const route = routes[url];

                  // Assert route
                  if (util.array(route)) {
                    route.forEach((item) => {
                      const action_name = item.action;
                      const action = controller[action_name];

                      // Assert action
                      if (action) {
                        let method_lower;
                        const method = route.hasOwnProperty('method') ? route.method : 'GET';

                        // assert method
                        if (util.string(method)
                          && methods.indexOf(method_lower = method.toLowerCase()) !== -1) {
                          // set auto router data
                          this[method_lower](url, (ctx, next) => {
                            const routeData = ctx.routeData || {};

                            routeData.action = action_name;
                            routeData.router = router_path;
                            routeData.controller = controller_path;

                            ctx.routeData = routeData;

                            return next();
                          });

                          // Cache router
                          this.router_set.push({
                            url: url,
                            action: action,
                            method: method_lower
                          });
                        } else {
                          throw new TypeError(`Method: ${ method } not support!`);
                        }
                      } else {
                        throw new Error(`Action: ${ action_name } can't be found in controller: ${ controller_path }!`);
                      }
                    });
                  } else {
                    throw new TypeError(`Route: ${ url } invalid!`);
                  }
                });
              } else {
                throw new TypeError(`Controller: ${ controller_path } invalid!`)
              }
            } else {
              throw new TypeError(`Router: ${ router_path } invalid!`);
            }
          }
        }
      });
  }

  /**
   * @method routes
   * @returns {Middleware}
   */
  routes() {
    // Add router
    this.router_set.forEach((item) => {
      this[item.method](item.url, item.action);
    });

    return super.routes.apply(this, arguments);
  }
}

/**
 * @function url
 * @description generate URL from url pattern and given `params`
 * @example
 *  var url = Interceptors.url('/users/:id', {id: 1});
 *  // => "/users/1"
 * @param {string} path url pattern
 * @param {Object} params url parameters
 * @returns {string}
 */
Interceptors.url = Router.url;

// exports
module.exports = Interceptors;

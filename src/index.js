/**
 * @module index
 * @license MIT
 * @version 2017/11/15
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import typpy from '.typpy';
import Router from 'koa-router';
import * as utils from './lib/utils';

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
    // Call super
    super(options);

    if (!router_base || !typpy(router_base, String)) {
      router_base = '/routers';
    }

    if (!controller_base || !typpy(controller_base, String)) {
      controller_base = '/controllers';
    }

    // Set prop
    this.router_set = [];
    this.router_base = path.resolve(router_base);
    this.controller_base = path.resolve(controller_base);

    // Call invoke
    this.invoke(this.router_base);
  }

  /**
   * @method invoke
   * @param {string} dir
   */
  invoke(dir) {
    fs.readdirSync(dir).forEach(filename => {
      const router_src = path.join(dir, filename);
      const stats = fs.statSync(router_src);

      // Is dir
      if (stats.isDirectory()) {
        this.invoke(router_src);
      } else if (stats.isFile()) {
        const ext = path.extname(router_src).toLowerCase();

        if (ext === '.js') {
          const routes = require(router_src);
          const router = utils.unixify(path.relative(utils.cwd, router_src));

          // Assert routes
          if (typpy(routes, Object)) {
            let controllers;
            const controller_src = path.join(this.controller_base, path.relative(this.router_base, router_src));
            const controller = utils.unixify(path.relative(utils.cwd, controller_src));

            // Load controllers
            try {
              controllers = require(controller_src);
            } catch (error) {
              if (error.code === MODULE_NOT_FOUND) {
                throw new Error(`Controller: ${controller} not found!`);
              } else {
                throw new Error(`Controller: ${controller} error occurred!\n  ${error}`);
              }
            }

            // Assert controllers
            if (typpy(controllers, Object)) {
              Object.keys(routes).forEach(url => {
                const route = routes[url];

                // Assert route
                if (Array.isArray(route)) {
                  route.forEach(item => {
                    const action_name = item.action;
                    const action = controllers[action_name];

                    // Assert action
                    if (action) {
                      const method = route.hasOwnProperty('method') ? route.method : 'GET';
                      const method_lower = method.toLowerCase();

                      // assert method
                      if (typpy(method, String) && methods.includes(method_lower)) {
                        // set auto router data
                        this[method_lower](url, (ctx, next) => {
                          const routeData = ctx.routeData || {};

                          routeData.action = action_name;
                          routeData.router = router;
                          routeData.controller = controller;

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
                        throw new TypeError(`Method: ${method} not support!`);
                      }
                    } else {
                      throw new Error(`Action: ${action_name} can't be found in controller: ${controller}!`);
                    }
                  });
                } else {
                  throw new TypeError(`Route: ${url} invalid!`);
                }
              });
            } else {
              throw new TypeError(`Controller: ${controller} invalid!`);
            }
          } else {
            throw new TypeError(`Router: ${router} invalid!`);
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
    this.router_set.forEach(item => {
      this[item.method](item.url, item.action);
    });

    return super.routes.apply(this, arguments);
  }
}

/**
 * @function url
 * @description generate URL from url pattern and given `params`
 * @example
 *  var url = Interceptors.url('/users/:id', { id: 1 });
 *  // => "/users/1"
 * @param {string} path url pattern
 * @param {Object} params url parameters
 * @returns {string}
 */
Interceptors.url = Router.url;

// exports
module.exports = Interceptors;

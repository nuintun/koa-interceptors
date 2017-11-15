/**
 * @module utils
 * @license MIT
 * @version 2017/11/15
 */

'use strict';

const cwd = process.cwd();
const path = require('path');

// Prototype method
const toString = Object.prototype.toString;

/**
 * @function type
 * @param {any} value
 * @returns {string}
 */
function type(value) {
  // Get real type
  let type = toString.call(value).toLowerCase();

  type = type.replace(/\[object (.+)]/, '$1').toLowerCase();

  // Is nan and infinity
  if (type === 'number') {
    // Is nan
    if (value !== value) {
      return 'nan';
    }

    // Is infinity
    if (!isFinite(value)) {
      return 'infinity';
    }
  }

  // Return type
  return type;
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
function normalize(path) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path = path.replace(/\\/g, '/');

  // :///a/b/c ==> ://a/b/c
  path = path.replace(/:\/{3,}/, '://');

  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(/\/\.\//g, '/');

  // a//b/c ==> a/b/c
  // //a/b/c ==> /a/b/c
  // a///b/////c ==> a/b/c
  path = path.replace(/(^|[^:])\/{2,}/g, '$1/');

  // Transfer path
  let src = path;
  // DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
  const DOUBLE_DOT_RE = /([^/]+)\/\.\.(?:\/|$)/g;

  // a/b/c/../../d ==> a/b/../d ==> a/d
  do {
    src = src.replace(DOUBLE_DOT_RE, (matched, dirname) => {
      return dirname === '..' ? matched : '';
    });

    // Break
    if (path === src) {
      break;
    } else {
      path = src;
    }
  } while (true);

  // Get path
  return path;
}

/**
 * @function object
 * @description Is object
 * @param {any} value
 * @returns {boolean}
 */
function object(value) {
  return type(value) === 'object';
}

/**
 * @function string
 * @description Is string
 * @param {any} value
 * @returns {boolean}
 */
function string(value) {
  return type(value) === 'string';
}

/**
 * @function array
 * @description Is array
 * @param {any} value
 * @returns {boolean}
 */
const array = Array.isArray ? Array.isArray : function(value) {
  return type(value) === 'array';
}

/**
 * @function realpath
 * @param {string} src
 * @returns {string}
 */
function realpath(src) {
  return path.join(cwd, src);
}

/**
 * @function path2cwd
 * @description Get path from cwd
 * @param {string} src
 * @returns {string}
 */
function path2cwd(src) {
  const relative = normalize(path.relative(cwd, src));

  if (relative.indexOf('./') === 0 && relative.indexOf('../') === 0) {
    return relative;
  } else {
    return '/' + relative;
  }
}

/**
 * @function src4router
 * @description Get src for router
 * @param {string} router_src
 * @param {string} router_base
 * @returns {*|string}
 */
function src4router(router_src, router_base) {
  return path.join(router_base, router_src);
}

/**
 * @function src4controller
 * @description Get src for controller
 * @param {string} controller_src
 * @param {string} router_base
 * @param {string} controller_base
 * @returns {string}
 */
function src4controller(controller_src, router_base, controller_base) {
  return path.join(controller_base, path.relative(router_base, controller_src));
}

// exports
module.exports = {
  cwd,
  type,
  normalize,
  object,
  string,
  array,
  realpath,
  path2cwd,
  src4router,
  src4controller
};

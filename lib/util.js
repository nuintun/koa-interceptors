/**
 * Created by nuintun on 2016/9/27.
 */

'use strict';

const cwd = process.cwd();
const path = require('path');

// prototype method
const toString = Object.prototype.toString;

// variable declaration
const BACKSLASH_RE = /\\/g;
const DOT_RE = /\/\.\//g;
const DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
const MULTI_SLASH_RE = /([^:/])\/+\//g;
const PROTOCOL_SLASH_RE = /(:)?\/{2,}/;

/**
 * type
 * @param value
 * @returns {*}
 */
function type(value){
  // get real type
  var type = toString.call(value).toLowerCase();

  type = type.replace(/\[object (.+)]/, '$1').toLowerCase();

  // nan and infinity
  if (type === 'number') {
    // nan
    if (value !== value) {
      return 'nan';
    }

    // infinity
    if (!isFinite(value)) {
      return 'infinity';
    }
  }

  // return type
  return type;
}

module.exports = {
  cwd: cwd,
  type: type,
  object: function (value){
    return type(value) === 'object';
  },
  string: function (value){
    return type(value) === 'string';
  },
  array: Array.isArray ? Array.isArray : function (value){
    return type(value) === 'array';
  },
  require: function (src){
    return require(path.resolve(src));
  },
  /**
   * normalize path
   * @param path
   * @returns {string}
   */
  normalize: function (path){
    // \a\b\.\c\.\d ==> /a/b/./c/./d
    path = path.replace(BACKSLASH_RE, '/');

    // :///a/b/c ==> ://a/b/c
    path = path.replace(PROTOCOL_SLASH_RE, '$1//');

    // /a/b/./c/./d ==> /a/b/c/d
    path = path.replace(DOT_RE, '/');

    // @author wh1100717
    // a//b/c ==> a/b/c
    // a///b/////c ==> a/b/c
    // DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
    path = path.replace(MULTI_SLASH_RE, '$1/');

    // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
    while (path.match(DOUBLE_DOT_RE)) {
      path = path.replace(DOUBLE_DOT_RE, '/');
    }

    // get path
    return path;
  }
};

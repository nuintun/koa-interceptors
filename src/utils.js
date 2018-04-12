/**
 * @module utils
 * @license MIT
 * @version 2017/11/15
 */

import http from 'http';

export const cwd = process.cwd();

/**
 * @function unixify
 * @description Convert path separators to posix/unix-style forward slashes.
 * @param {string} path
 * @returns {string}
 */
export function unixify(path) {
  return path.replace(/\\/g, '/');
}

export const METHODS = http.METHODS.map(method => {
  return method.toLowerCase();
});

/**
 * @module typpy
 * @license MIT
 * @version 2018/03/26
 * @see https://github.com/IonicaBizau/typpy
 */

/**
 * @function typpy
 * @description Gets the type of the input value or compares it with a provided type
 * @param {Anything} input The input value
 * @param {Constructor|String} target The target type
 * @returns {String|Boolean}
 */
export default function typpy(input, target) {
  // If only one arguments, return string type
  if (arguments.length === 1) return typpy.typeof(input, false);

  // If input is NaN, use special check
  if (input !== input) return target !== target || target === 'nan';

  // Other
  return typpy.typeof(input, typpy.typeof(target, true) !== String) === target;
}

/**
 * @function typeof
 * @description Gets the type of the input value. This is used internally
 * @param {Anything} input The input value
 * @param {Boolean} ctor A flag to indicate if the return value should be a string or not
 * @returns {Constructor|String}
 */
typpy.typeof = function(input, ctor) {
  // NaN
  if (input !== input) return ctor ? NaN : 'nan';
  // Null
  if (null === input) return ctor ? null : 'null';
  // Undefined
  if (undefined === input) return ctor ? undefined : 'undefined';

  // Other
  return ctor ? input.constructor : input.constructor.name.toLowerCase();
};

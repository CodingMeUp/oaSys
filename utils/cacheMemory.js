/**
 * 缓存数据到内存中
 * 使用  var cache = require('../utils/cacheMemory');
 *
 *
 * cache.put('test', 'test');
 * console.log(cache.get('test'))
 *
 * cache.put('test', 'test', 1000 * 60); 设置过期时间
 *
 * cache.del('test'); // 删除
 * cache.clear();
 */

'use strict';
var cache = Object.create(null);
var debug = false;
var hitCount = 0; // 缓存命中的次数
var missCount = 0; // 缓存未命中的次数
var size = 0; // 缓存的key个数

/**
 * 写入缓存
 * @param key string 缓存键名 字符串
 * @param value object
 * @param time number 时间大于零的数字，毫秒 不定义该参数时，缓存不会过时
 * @param timeoutCallback function 缓存过时后的回调函数
 * @returns {*}
 */
exports.put = function (key, value, time, timeoutCallback) {
  if (debug) {
    console.log('caching: %s = %j (@%s)', key, value, time);
  }

  if (!key || typeof key !== 'string') {
    throw new Error('Cache key must be a string');
  } else if (value === undefined) {
    throw new Error('Cache value must be definition');
  } else if (typeof time !== 'undefined' && (typeof time !== 'number' || isNaN(time) || time <= 0)) {
    throw new Error('Cache timeout must be a positive number');
  } else if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
    throw new Error('Cache timeout callback must be a function');
  }

  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
  } else {
    size++;
  }

  var record = {
    value: value,
    expire: time + Date.now()
  };

  if (!isNaN(record.expire)) {
    record.timeout = setTimeout(function () {
      _del(key);
      if (timeoutCallback) {
        timeoutCallback(key, value);
      }
    }, time);
  }

  cache[key] = record;

  return value;
};

/**
 * 按 key 删除 缓存
 * @param key
 * @returns {boolean}
 */
exports.del = function (key) {
  var canDelete = true;

  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
    if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
      canDelete = false;
    }
  } else {
    canDelete = false;
  }

  if (canDelete) {
    _del(key);
  }

  return canDelete;
};

function _del(key) {
  size--;
  delete cache[key];
}

/**
 * 清空所有缓存
 */
exports.clear = function () {
  for (var key in cache) {
    if (cache.hasOwnProperty(key)) {
      clearTimeout(cache[key].timeout);
    }
  }
  size = 0;
  cache = Object.create(null);
  if (debug) {
    hitCount = 0;
    missCount = 0;
  }
};

/**
 * 按键名获取缓存值
 * @param key
 * @returns {*}
 */
exports.get = function (key) {
  var data = cache[key];
  if (typeof data != "undefined") {
    if (isNaN(data.expire) || data.expire >= Date.now()) {
      if (debug) hitCount++;
      return data.value;
    } else {
      if (debug) missCount++;
      size--;
      delete cache[key];
    }
  } else if (debug) {
    missCount++;
  }
  return null;
};

exports.size = function () {
  return size;
};

exports.debug = function (bool) {
  debug = bool;
};

exports.hits = function () {
  return hitCount;
};

exports.misses = function () {
  return missCount;
};

exports.keys = function () {
  return Object.keys(cache);
};
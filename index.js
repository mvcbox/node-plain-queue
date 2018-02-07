'use strict';

/**
 * @type {Queue}
 */
module.exports = Queue;

/**
 * @param {Function} callback
 */
function whileLoop(callback) {
    setImmediate(function () {
        callback(function (brakeFlag) {
            brakeFlag || whileLoop(callback);
        });
    });
}

/**
 * @constructor
 */
function Queue() {}

/**
 * @type {Array}
 * @private
 */
Queue.prototype._queue = [];

/**
 * @param {Function} item
 * @return {Queue}
 */
Queue.prototype.push = function (item) {
    this._queue.push(item);

    if (1 === this._queue.length) {
        this._startLoop();
    }

    return this;
};

/**
 * @private
 */
Queue.prototype._startLoop = function () {
    var _this = this;
    var item;

    whileLoop(function (next) {
        item = _this._queue.shift();

        if (typeof item !== 'function') {
            return next(!_this._queue.length);
        }

        item(function () {
            next(!_this._queue.length);
        });
    });
};

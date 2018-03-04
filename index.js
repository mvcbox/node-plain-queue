'use strict';

/**
 * @type {Queue}
 */
module.exports = Queue;

/**
 * @param {Function} scheduler
 * @param {Function} callback
 */
function whileLoop(scheduler, callback) {
    scheduler(function () {
        callback(function (brakeFlag) {
            brakeFlag || whileLoop(scheduler, callback);
        });
    });
}

/**
 * @param {Object} options
 * @constructor
 */
function Queue(options) {
    options = options || {};
    this._queue = [];

    if (typeof options.scheduler === 'function') {
        this._scheduler = options.scheduler;
    } else {
        this._scheduler = setImmediate;
    }
}

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

    whileLoop(this._scheduler, function (next) {
        item = _this._queue.shift();

        if (typeof item !== 'function') {
            return next(!_this._queue.length);
        }

        item(function () {
            next(!_this._queue.length);
        });
    });
};

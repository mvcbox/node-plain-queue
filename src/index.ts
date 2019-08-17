// For Node.js versions 0.x.x
if (!global.Promise) {
    global.Promise = require('bluebird');
}

export { Task } from './Task';
export { Queue } from './Queue';
export { TaskOptions } from './TaskOptions';
export { TaskFunction } from './TaskFunction';
export { QueueOptions } from './QueueOptions';
export { TimeoutError } from './TimeoutError';
export { OnCompleteCallback } from './OnCompleteCallback';

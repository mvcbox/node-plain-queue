# plain-queue
Queue library
Support Node.js starting from version 4.0.0

## Install
```bash
npm install --save plain-queue
```

### Options for class ```Queue```
- ```taskTimeout``` (```Number```) - Optional parameter. Execution timeout for each task. 
If the value is not set, then the tasks do not have a time limit for execution. (Default: ```undefined```)
- ```gcThreshold``` (```Number```) - Optional parameter.
Threshold for the garbage collector that deletes completed tasks. (Default: ```100```)
##### Example:
```javascript
'use strict';

const { Queue } = require('plain-queue');
const queue = new Queue({
    taskTimeout: 5000,
    gcThreshold: 300
});
```

### Queue class method - ```addTask(taskFunction, options)```
- ```taskFunction``` (```Function```) - Required argument. Function to be performed. 
The function should return a promise. The task is considered completed when the promise is resolved. 
After the promise is resolved, the queue will proceed to the next task. 
If the function returns something other than a promise, then it is considered that this task was completed.
- ```options``` (```Object```) - Optional argument. Object with custom settings for the task.
- ```options.timeout``` (```Number```) - Optional parameter. 
Execution timeout for task. If no value is specified, then it will be use the value from ```taskTimeout```.
##### Example:
```javascript
'use strict';

const { Queue } = require('plain-queue');
const queue = new Queue;

queue.addTask(function() {
    // Some work... 
}, {
    timeout: 3000 // Set 3 seconds timeout 
});
```
- ```Return value``` (```Promise```) - Returns a promise that will be resolved after the task is completed.
If an unhandled exception occurs, the promise will be rejected.

##### Example:
```javascript
'use strict';

const { Queue } = require('plain-queue');
const queue = new Queue;

// Just return the value
queue.addTask(function () {
    console.log('--- Task 1 start');

    return 'Task 1 result';
}).then(console.log).catch(console.error);

// Throw an unhandled exception
queue.addTask(function () {
    console.log('--- Task 2 start');

    throw new Error('Some error in Task 2');

    return 'Task 2 result';
}).then(console.log).catch(console.error);

// Throw an exception, which will be handled inside the task
queue.addTask(function () {
    console.log('--- Task 3 start');

    try {
        throw new Error('Some error in Task 3');
    } catch (e) {
        // Exception handling
    }

    return 'Task 3 result';
}).then(console.log).catch(console.error);


// async/await example
queue.addTask(async function () {
    console.log('--- Task 4 start');

    const string1 = await Promise.resolve('Task 4');
    const string2 = await Promise.resolve(' result');

    return string1 + string2;
}).then(console.log).catch(console.error);

// Timeout error example
queue.addTask(function () {
    console.log('--- Task 5 start');

    return new Promise(function (resolve) {
        setTimeout(resolve, 3000, 'Task 5 result');
    });
}, {
    timeout: 1000 // Set timout for task
}).then(console.log).catch(console.error);
```

### Output
```
--- Task 1 start
Task 1 result
--- Task 2 start
Error: Some error in Task 2
    at Object.taskFunction (/Users/user/Projects/node-plain-queue/test.js:17:11)
    at Queue.<anonymous> (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:67:39)
    at step (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:32:23)
    at Object.next (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:13:53)
    at fulfilled (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:4:58)
    at processTicksAndRejections (internal/process/task_queues.js:85:5)
--- Task 3 start
Task 3 result
--- Task 4 start
Task 4 result
--- Task 5 start
Error: Task timeout [1000ms]
    at new TimeoutError (/Users/user/Projects/node-plain-queue/src/dist/TimeoutError.js:19:42)
    at Queue.<anonymous> (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:69:93)
    at step (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:32:23)
    at Object.next (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:13:53)
    at fulfilled (/Users/user/Projects/node-plain-queue/src/dist/Queue.js:4:58)
    at processTicksAndRejections (internal/process/task_queues.js:85:5)
```

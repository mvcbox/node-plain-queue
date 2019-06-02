# node-plain-queue
Queue library

###Example:
```javascript
'use strict';

const { Queue } = require('plain-queue');
const queue = new Queue;

queue.push(function (next) {
    console.log('Task 1');
    setTimeout(next, 1000);
});

queue.push(function (next) {
    console.log('Task 2');
    setTimeout(next, 1000);
});

queue.push(function (next) {
    console.log('Task 3');
    setTimeout(next, 1000);
});
```

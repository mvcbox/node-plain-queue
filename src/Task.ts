import { TaskOptions } from './TaskOptions';
import { TaskFunction } from './TaskFunction';
import { OnCompleteCallback } from './OnCompleteCallback';

export interface Task<R = any> {
    options?: TaskOptions;
    taskFunction: TaskFunction<R>;
    onComplete: OnCompleteCallback;
}

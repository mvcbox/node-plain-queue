import { TaskOptions } from './TaskOptions';
import { TaskFunction } from './TaskFunction';
import { OnCompleteCallback } from './OnCompleteCallback';

export interface Task<R> {
    options?: TaskOptions;
    taskFunction: TaskFunction<R>;
    onComplete: OnCompleteCallback;
}

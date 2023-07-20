import { TaskOptions } from './TaskOptions';
import { TaskFunction } from './TaskFunction';
import { OnCompleteCallback } from './OnCompleteCallback';

export interface Task<T,R> {
    taskData?: T;
    options?: TaskOptions;
    onComplete?: OnCompleteCallback;
    taskFunction?: TaskFunction<T,R>;
}

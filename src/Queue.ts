import Bluebird from 'bluebird';
import { Task } from './Task';
import { TaskOptions } from './TaskOptions';
import { TimeoutError } from './TimeoutError';
import { TaskFunction } from './TaskFunction';
import { QueueOptions } from './QueueOptions';
import { emptyFunction } from './empty-function';
import { DEFAULT_GC_THRESHOLD } from './constants';

export class Queue<T,R> {
    public taskPointer = 0;
    public gcThreshold: number;
    public taskTimeout?: number;
    public isIdle: boolean = true;
    public tasks: Task<any,any>[] = [];
    public taskFunction?: TaskFunction<T,R>;

    public constructor(options?: QueueOptions) {
        this.taskTimeout = options?.taskTimeout;
        this.gcThreshold = options?.gcThreshold ?? DEFAULT_GC_THRESHOLD;
    }

    public setTaskFunction(input: TaskFunction<T,R>): this {
        this.taskFunction = input;
        return this;
    }

    public deleteTaskFunction(): this {
        delete this.taskFunction;
        return this;
    }

    public getNextTask(): Task<any,any> | undefined {
        if (this.taskPointer > this.gcThreshold) {
            this.gc();
        }

        return this.tasks[this.taskPointer++];
    }

    public hasTasks(): boolean {
        return this.tasks.length > this.taskPointer;
    }

    public gc(): this {
        if (this.hasTasks()) {
            this.tasks = this.tasks.slice(this.taskPointer);
        } else {
            this.tasks = [];
        }

        this.taskPointer = 0;
        return this;
    }

    public async startLoop(): Promise<void> {
        this.isIdle = false;

        while (this.hasTasks()) {
            const task: Task<any,any> | undefined = this.getNextTask();

            if (!task) {
                continue;
            }

            const timeout = task.options?.timeout ?? this.taskTimeout;
            const taskFunction: TaskFunction<any,any> | undefined = task.taskFunction ?? this.taskFunction;
            const onComplete = task.onComplete;

            if (!taskFunction) {
                continue;
            }

            try {
                let result = taskFunction(task.taskData);

                if (timeout) {
                    result = Bluebird.resolve(result).timeout(timeout, new TimeoutError(`Task timeout [${timeout}ms]`))
                } else {
                    result = Promise.resolve(result);
                }

                if (onComplete) {
                    await result.then(function(result) { onComplete(undefined, result); });
                } else {
                    await result;
                }
            } catch (err) {
                onComplete && onComplete(err);
            }

            // Trick for Node.js event loop
            // It is necessary for the Promise returned by the addTask method to be resolved before the next task starts.
            await Bluebird.resolve();
        }

        this.gc();
        this.isIdle = true;
    }

    public addTaskData(taskData: T, options?: TaskOptions): Promise<R> | void {
        if (!options?.ignoreResult) {
            return new Bluebird<R>((resolve, reject) => {
                this.tasks.push({
                    taskData,
                    options,
                    onComplete(err: any, result: any) {
                        err ? reject(err) : resolve(result);
                    }
                });

                this.isIdle && this.startLoop();
            });
        }

        this.tasks.push({ taskData, options });
        this.isIdle && this.startLoop();
    }

    public addTask<RR>(taskFunction: TaskFunction<any,RR>, options?: TaskOptions): Promise<RR> | void {
        if (!options?.ignoreResult) {
            return new Bluebird<RR>((resolve, reject) => {
                this.tasks.push({
                    taskFunction,
                    options,
                    onComplete(err: any, result: any) {
                        err ? reject(err) : resolve(result);
                    }
                });

                this.isIdle && this.startLoop();
            });
        }

        this.tasks.push({ taskFunction, options });
        this.isIdle && this.startLoop();
    }
}

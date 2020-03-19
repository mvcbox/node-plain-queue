import Bluebird from 'bluebird';
import { Task } from './Task';
import { TaskOptions } from './TaskOptions';
import { TimeoutError } from './TimeoutError';
import { TaskFunction } from './TaskFunction';
import { QueueOptions } from './QueueOptions';
import { DEFAULT_GC_THRESHOLD } from './constants';

export class Queue {
    public taskPointer = 0;
    public tasks: Task<any>[] = [];
    public gcThreshold: number;
    public taskTimeout?: number;
    public isIdle: boolean = true;

    public constructor(options?: QueueOptions) {
        options = options || {};
        this.taskTimeout = options.taskTimeout;
        this.gcThreshold = options.gcThreshold || DEFAULT_GC_THRESHOLD;
    }

    public getNextTask(): Task<any> | undefined {
        if (this.taskPointer > this.gcThreshold) {
            this.gc();
        }

        return this.tasks[this.taskPointer++];
    }

    public haveTasks(): boolean {
        return this.tasks.length > this.taskPointer;
    }

    public gc(): void {
        if (this.haveTasks()) {
            this.tasks = this.tasks.slice(this.taskPointer);
        } else {
            this.tasks = [];
        }

        this.taskPointer = 0;
    }

    public async startLoop(): Promise<void> {
        this.isIdle = false;

        while (this.haveTasks()) {
            const task: Task<any> | undefined = this.getNextTask();

            if (!task || !task.taskFunction || !task.onComplete) {
                continue;
            }

            const timeout = task.options && task.options.timeout || this.taskTimeout;

            try {
                let result = task.taskFunction();

                if (timeout) {
                    result = Bluebird.resolve(result).timeout(timeout, new TimeoutError(`Task timeout [${timeout}ms]`))
                }

                task.onComplete(undefined, await result);
            } catch (err) {
                task.onComplete(err);
            }

            // Trick for Node.js event loop
            // It is necessary for the Promise returned by the addTask method to be resolved before the next task starts.
            await Bluebird.resolve();
        }

        this.gc();
        this.isIdle = true;
    }

    public addTask<R>(taskFunction: TaskFunction<R>, options?: TaskOptions): Promise<R> {
        return new Bluebird<R>((resolve, reject) => {
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
}

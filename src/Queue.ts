import Bluebird from 'bluebird';
import { Task } from './Task';
import { TaskOptions } from './TaskOptions';
import { TimeoutError } from './TimeoutError';
import { TaskFunction } from './TaskFunction';
import { QueueOptions } from './QueueOptions';

export class Queue {
    public tasks: Task[] = [];
    public options: QueueOptions;
    public isIdle: boolean = true;

    public constructor(options?: QueueOptions) {
        this.options = options || {};
    }

    protected async startLoop() {
        this.isIdle = false;

        while (this.tasks.length) {
            const task: Task | undefined = this.tasks.shift();

            if (!task || !task.taskFunction || !task.onComplete) {
                continue;
            }

            const timeout = task.options && task.options.timeout || this.options.taskTimeout;

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

        this.isIdle = true;
    }

    public addTask<R = any>(taskFunction: TaskFunction<R>, options?: TaskOptions): Promise<R> {
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

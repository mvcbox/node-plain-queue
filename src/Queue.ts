import TaskItem from './TaskItem';
import QueueOptions from './QueueOptions';

export default class Queue {
    private _queue: TaskItem[] = [];
    private _inProgress: boolean = false;
    private _scheduler: Function = setImmediate;

    constructor(options: QueueOptions = {}) {
        if (options.scheduler) {
            this._scheduler = options.scheduler;
        }
    }

    private _updateProgressStatus(): void {
        this._inProgress = !!this._queue.length;
    }

    private _whileLoop(callback: Function): void {
        this._scheduler(() => {
            callback((brakeFlag: boolean) => {
                brakeFlag || this._whileLoop(callback);
            });
        });
    }

    private _startLoop(): void {
        this._inProgress = true;

        this._whileLoop((next: Function) => {
            const item: TaskItem | undefined = this._queue.shift();

            if (typeof item !== 'function') {
                this._updateProgressStatus();
                return next(!this._inProgress);
            }

            item(() => {
                this._updateProgressStatus();
                next(!this._inProgress);
            });
        });
    }

    public push(task: TaskItem): this {
        this._queue.push(task);
        !this._inProgress && this._startLoop();
        return this;
    }
}

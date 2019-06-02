import TaskItem from './TaskItem';
import QueueOptions from './QueueOptions';

export default class Queue {
    private _queue: TaskItem[] = [];
    private _isIdle: boolean = true;
    private _scheduler: Function = setImmediate;

    constructor(options: QueueOptions = {}) {
        if (options.scheduler) {
            this._scheduler = options.scheduler;
        }
    }

    private _updateStatus(): void {
        this._isIdle = !this._queue.length;
    }

    private _whileLoop(callback: Function): void {
        this._scheduler(() => {
            callback((brakeFlag: boolean) => {
                brakeFlag || this._whileLoop(callback);
            });
        });
    }

    private _startLoop(): void {
        this._isIdle = false;

        this._whileLoop((next: Function) => {
            const item: TaskItem | undefined = this._queue.shift();

            if (typeof item !== 'function') {
                this._updateStatus();
                return next(this._isIdle);
            }

            item(() => {
                this._updateStatus();
                next(this._isIdle);
            });
        });
    }

    public push(task: TaskItem): this {
        this._queue.push(task);
        this._isIdle && this._startLoop();
        return this;
    }
}

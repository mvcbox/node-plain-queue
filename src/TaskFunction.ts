export interface TaskFunction<R = any> {
    <R>(): Promise<R>;
}

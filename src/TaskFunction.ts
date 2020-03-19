export interface TaskFunction<R> {
    (): Promise<R>;
}

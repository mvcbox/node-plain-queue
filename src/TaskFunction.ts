export interface TaskFunction<T,R> {
    (input: T): Promise<R>;
}

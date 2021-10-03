export interface Type<T> {
  new(...params: any[]): T;
}

export function ofType<T>(t: Type<T>) {
  return (x: any): x is T => x instanceof t;
}

export type The<T, V extends T> = V
export type Fn<As extends any[], R> = (...args: As) => R
export type Predicate<A> = Fn<[A], boolean>
export type Refinement<A, B extends A> = (a: A) => a is B

export type Curried2<A, B, R> = Fn<[A], Fn<[B], R>>
export type Curried3<A, B, C, R> = Fn<[A], Fn<[B], Fn<[C], R>>>
export type Curried4<A, B, C, D, R> = Fn<[A], Fn<[B], Fn<[C], Fn<[D], R>>>>
export type Curried5<A, B, C, D, E, R> = Fn<[A], Fn<[B], Fn<[C], Fn<[D], Fn<[E], R>>>>>

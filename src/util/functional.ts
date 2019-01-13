import { Fn, Curried2 } from './types'

// Combinators
export const I = <A>(a: A) => a
export const K = <A>(a: A) => <B>(_?: B) => a
// types won't work if we use I instead unless we use a
// type assertion at the call site because typescript
// does not have a proper unification algorithm
// instead we special-case the type here
export const A: <A, B>(f: Fn<[A], B>) => Fn<[A], B> = I
export const T = <A>(a: A) => <B>(fn: Fn<[A], B>) => fn(a)
export const W = <A, B>(f: Curried2<A, A, B>) => (x: A) => f(x)(x)
export const C =
  <A, B, C>(f: Curried2<A, B, C>) =>
           (b: B) =>
           (a: A) => f(a)(b)
export const B =
  <A, B, C>(f: Fn<[B], C>) =>
           (g: Fn<[A], B>) =>
           (x: A) => f(g(x))
export const S =
  <A, B, C>(f: Curried2<A, B, C>) =>
           (g: Fn<[A], B>) =>
           (x: A) => f(x)(g(x))
export const P =
  <B, C>(f: Curried2<B, B, C>) =>
     <A>(g: Fn<[A], B>) =>
        (x: A) =>
        (y: A) => f(g(x))(g(y))

export { I as id, K as const, A as apply, C as flip }

export const tuple = <Xs extends any[]>(...xs: Xs) => xs
export const fst = <Ts extends [any, ...any[]]>([v]: Ts) => v
export const snd = <Ts extends [any, any, ...any[]]>([,v]: Ts) => v
export const property = <T, K extends keyof T>(k: K) => (o: T) => o[k]

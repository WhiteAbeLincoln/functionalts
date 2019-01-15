import { HKT, URIS, Type, URI_Tag } from './HKT'
import { getTypeclass } from '../util/util'
import { isTypeclass } from './register'

// type-level dictionaries for Functors
// allows distinguishing between all HKTs and just those that are functors
export interface URI2Functor<A> {}
export type FunctorURIS = URIS & URI2Functor<any>[keyof URI2Functor<any>][URI_Tag]

export interface Functor<F> {
  readonly URI: F
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
}

export interface Functor1<F extends FunctorURIS> {
  readonly URI: F
  readonly map: <A, B>(fa: Type<F, A>, f: (a: A) => B) => Type<F, B>
}

export const isFunctor = (f: any): f is Functor<any> =>
  isTypeclass(f) && typeof (f as any)['map'] === 'function'

export const getFunctor: <F>(fa: HKT<F, any>) => Functor<F> = getTypeclass(isFunctor, 'Functor')

export function map<FA extends Type<FunctorURIS, any>, B>(fa: FA, f: (a: FA['_A']) => B): Type<FA[URI_Tag], B>
// export function map<F, A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B>
export function map<F, A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B> {
  // when receive a fa value, look up it's HKT tag in the functor table
  // this gives the specific map function that operates on that HKT
  return getFunctor(fa).map(fa, f)
}

export function mapC<A, B>(f: (a: A) => B): <FA extends Type<FunctorURIS, A>>(fa: FA) => Type<FA[URI_Tag], B>
export function mapC<A, B>(f: (a: A) => B): (fa: any) => any {
  return <F>(fa: HKT<F, A>) => getFunctor(fa).map(fa, f)
}

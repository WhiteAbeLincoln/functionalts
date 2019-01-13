import { HKT, URIS, Type, URI_Tag } from './HKT'
import { getInstance } from './register'

// type-level dictionaries for Functors
export interface URI2Functor<A> {}
export type FunctorURIS = URIS & URI2Functor<any>[keyof URI2Functor<any>][typeof URI_Tag]

export interface Functor<F> {
  readonly URI: F
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
}

export interface Functor1<F extends FunctorURIS> {
  readonly URI: F
  readonly map: <A, B>(fa: Type<F, A>, f: (a: A) => B) => Type<F, B>
}

export const isFunctor = (f: any): f is Functor<any> => {
  return (
       typeof f === 'object'
    && f !== null
    && typeof f['URI'] !== 'undefined'
    && typeof f['map'] === 'function'
  )
}

const getFunctor = <F>(f: F): Functor<F> | false | undefined => {
  const inst = getInstance(f)
  // should I be checking twice? I avoid the isFunctor call if inst is undefined
  return inst && isFunctor(inst) && inst
}

export function map<FA extends Type<FunctorURIS, any>, B>(fa: FA, f: (a: FA['_A']) => B): Type<FA[typeof URI_Tag], B>
export function map<F, A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B>
export function map<F, A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B> {
  // when recieve a fa value, look up it's HKT tag in the functor table
  // this gives the specific map function that operates on that HKT
  const tag = fa[URI_Tag]
  const fmodule = getFunctor(tag)
  if (!fmodule) {
    throw new Error(`Functor Module for HKT with tag ${tag} is not registered`)
  }
  return fmodule.map(fa, f)
}

export function mapC<FA extends Type<FunctorURIS, any>, B>(f: (a: FA['_A']) => B): (fa: FA) => Type<FA[typeof URI_Tag], B>
export function mapC<F, A, B>(f: (a: A) => B): (fa: HKT<F, A>) => HKT<F, B>
export function mapC<F, A, B>(f: (a: A) => B): (fa: HKT<F, A>) => HKT<F, B> {
  return fa => map<F, A, B>(fa, f)
}

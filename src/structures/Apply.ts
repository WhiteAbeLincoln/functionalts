import { Functor, FunctorURIS, Functor1, isFunctor } from './Functor'
import { HKT, URI_Tag, Type, getTagValue } from './HKT'
import { Fn } from '../util/types'
import { getInstance } from './register'

export interface URI2Apply<A> {}
export type ApplyURIS = FunctorURIS & URI2Apply<any>[keyof URI2Apply<any>][typeof URI_Tag]

export interface Apply<F> extends Functor<F> {
  readonly ap: <A, B>(fab: HKT<F, Fn<[A], B>>, fa: HKT<F, A>) => HKT<F, B>
}

export interface Apply1<F extends ApplyURIS> extends Functor1<F> {
  readonly ap: <A, B>(fab: Type<F, Fn<[A], B>>, fa: Type<F, A>) => Type<F, B>
}

export const isApply = (f: any): f is Apply<any> => {
  return isFunctor(f) && typeof (f as any)['ap'] !== 'undefined'
}

const getApply = <F>(f: F | undefined): Apply<F> | false | undefined => {
  /* istanbul ignore if */
  if (typeof f === 'undefined') return false
  const inst = getInstance(f)
  // should I be checking twice? I avoid the isFunctor call if inst is undefined
  return inst && isApply(inst) && inst
}

export function ap<FA extends Type<ApplyURIS, any>, B>(fab: Type<FA[URI_Tag], Fn<[FA['_A']], B>>, fa: FA): Type<FA[URI_Tag], B>
export function ap<F, A, B>(fab: HKT<F, Fn<[A], B>>, fa: HKT<F, A>): HKT<F, B>
export function ap<F, A, B>(fab: HKT<F, Fn<[A], B>>, fa: HKT<F, A>): HKT<F, B> {
  const tag = getTagValue(fab)
  const fmodule = getApply(tag)
  if (!fmodule) {
    throw new Error(`Apply Module for HKT with tag ${tag} is not registered`)
  }
  return fmodule.ap(fab, fa)
}

export function apC<FA extends Type<ApplyURIS, any>, B>(fab: Type<FA[URI_Tag], Fn<[FA['_A']], B>>): (fa: FA) => Type<FA[URI_Tag], B>
export function apC<F, A, B>(fab: HKT<F, Fn<[A], B>>): (fa: HKT<F, A>) => HKT<F, B>
export function apC<F, A, B>(fab: HKT<F, Fn<[A], B>>): (fa: HKT<F, A>) => HKT<F, B> {
  return fa => ap(fab, fa)
}

import { Functor, Functor1, isFunctor, FunctorURIS } from './Functor'
import { HKT, URIS, Type, URI_Tag, getTagValue } from './HKT'
import { getInstance } from './register'

export interface URI2Alt<A> {}
// sometimes typescript gives an error: property URI_Tag does not exist on type <list of alt types>
// this is a bug in the typescript compiler or language service
// (caused by the modification of the Array interface),
// it is safe to ignore and building still works properly
export type AltURIS = FunctorURIS & URI2Alt<any>[keyof URI2Alt<any>][URI_Tag]

export interface Alt<F> extends Functor<F> {
  readonly alt: <A>(fx: HKT<F, A>, fy: HKT<F, A>) => HKT<F, A>
}

export interface Alt1<F extends AltURIS> extends Functor1<F> {
  readonly alt: <A>(fx: Type<F, A>, fy: Type<F, A>) => Type<F, A>
}

export const isAlt = (f: any): f is Alt<any> => {
  return isFunctor(f) && typeof (f as any)['alt'] === 'function'
}

const getAlt = <F>(f: F | undefined): Alt<F> | false | undefined => {
  /* istanbul ignore if */
  if (typeof f === 'undefined') return false
  const inst = getInstance(f)
  return inst && isAlt(inst) && inst
}

export function alt<A extends Type<AltURIS, any>>(fx: A, fy: A): A
export function alt<F, A>(fx: HKT<F, A>, fy: HKT<F, A>): HKT<F, A>
export function alt<F, A>(fx: HKT<F, A>, fy: HKT<F, A>): HKT<F, A> {
  // when recieve a fa value, look up it's HKT tag in the functor table
  // this gives the specific map function that operates on that HKT
  const tag = getTagValue(fx)
  const fmodule = getAlt(tag)
  if (!fmodule) {
    throw new Error(`Alt Module for HKT with tag ${tag} is not registered`)
  }
  // we'll rely on the typesystem and not get the module for
  // the other Alt. We want to avoid as much runtime overhead as possible
  return fmodule.alt(fx, fy)
}

export function altC<A extends Type<URIS, any>>(fx: A): (fy: A) => A
export function altC<F, A>(fx: HKT<F, A>): (fy: HKT<F, A>) => HKT<F, A>
export function altC<F, A>(fx: HKT<F, A>): (fy: HKT<F, A>) => HKT<F, A> {
  return fy => alt<F, A>(fx, fy)
}

import { AltURIS, Alt, Alt1, isAlt } from './Alt'
import { URI_Tag, HKT, Type } from './HKT'
import { getInstance } from './register'

export interface URI2Plus<A> {}
export type PlusURIS = AltURIS & URI2Plus<any>[keyof URI2Plus<any>][typeof URI_Tag]

export interface Plus<F> extends Alt<F> {
  readonly zero: <A>() => HKT<F, A>
}

export interface Plus1<F extends PlusURIS> extends Alt1<F> {
  readonly zero: <A>() => Type<F, A>
}

export const isPlus = (f: any): f is Plus<any> => {
  return isAlt(f) && typeof (f as any)['zero'] === 'function'
}

const getPlus = <F>(f: F): Plus<F> | false | undefined => {
  const inst = getInstance(f)

  return inst && isPlus(inst) && inst
}

// in this case we do need to pass in a type rep, since we have no value that we can pull it from
export function zero<FA extends Type<PlusURIS, any>>(value: FA): Plus1<FA[typeof URI_Tag]>['zero']
export function zero<F extends PlusURIS>(typeRep: Plus1<F>): Plus1<F>['zero']
export function zero<F>(typeRep: Plus<F>): Plus<F>['zero']
export function zero(obj: { URI?: any, zero?: Plus<any>['zero'], [URI_Tag]?: any }): Plus<any>['zero'] {
  // if we were passed a plus module as a typerep we can return it's zero directly
  if (obj.URI && obj.zero) return obj.zero
  // they should be the same
  const tag = obj.URI || obj[URI_Tag]
  if (tag) {
    const pmodule = getPlus(tag)
    if (!pmodule) {
      throw new Error(`Plus Module for HKT with tag ${tag} is not registered`)
    }
    return pmodule.zero
  }
  throw new Error('TypeRep given to zero is not sufficient to determine module')
}

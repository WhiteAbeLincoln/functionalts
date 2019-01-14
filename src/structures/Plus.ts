import { AltURIS, Alt, Alt1, isAlt } from './Alt'
import { URI_Tag, HKT, Type } from './HKT'

export interface URI2Plus<A> {}
export type PlusURIS = AltURIS & URI2Plus<any>[keyof URI2Plus<any>][URI_Tag]

export interface Plus<F> extends Alt<F> {
  readonly zero: <A>() => HKT<F, A>
}

export interface Plus1<F extends PlusURIS> extends Alt1<F> {
  readonly zero: <A>() => Type<F, A>
}

export const isPlus = (f: any): f is Plus<any> => {
  return isAlt(f) && typeof (f as any)['zero'] === 'function'
}

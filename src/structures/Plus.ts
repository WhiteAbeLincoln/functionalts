import { AltURIS, Alt, Alt1, isAlt } from './Alt'
import { URI_Tag, HKT, Type } from './HKT'
import { getTypeclass } from '../util/util'

export interface URI2Plus<A> {}
export type PlusURIS = AltURIS & URI2Plus<any>[keyof URI2Plus<any>][URI_Tag]

export interface Plus<F> extends Alt<F> {
  readonly zero: <A>() => HKT<F, A>
}

export interface Plus1<F extends PlusURIS> extends Alt1<F> {
  readonly zero: <A>() => Type<F, A>
}

export const isPlus = (f: any): f is Plus<any> =>
  isAlt(f) && typeof (f as any)['zero'] === 'function'

export const getPlus: <F>(f: HKT<F, any>) => Plus<F> = getTypeclass(isPlus, 'Plus')

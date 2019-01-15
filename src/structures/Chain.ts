import { ApplyURIS, Apply, Apply1, isApply } from './Apply'
import { URI_Tag, HKT, Type } from './HKT'
import { Fn } from '../util/types'
import { getTypeclass } from '../util/util'

export interface URI2Chain<A> {}
export type ChainURIS = ApplyURIS & URI2Chain<any>[keyof URI2Chain<any>][URI_Tag]

export interface Chain<F> extends Apply<F> {
  readonly chain: <A, B>(fa: HKT<F, A>, fn: Fn<[A], HKT<F, B>>) => HKT<F, B>
}

export interface Chain1<F extends ChainURIS> extends Apply1<F> {
  readonly chain: <A, B>(fa: Type<F, A>, fn: Fn<[A], Type<F, B>>) => Type<F, B>
}

export const isChain = (f: any): f is Chain<any> =>
  isApply(f) && typeof (f as any)['chain'] === 'function'


export const getChain: <F>(fa: HKT<F, any>) => Chain<F> = getTypeclass(isChain, 'Chain')

export function chain<FA extends Type<ChainURIS, any>, B>(fa: FA, f: (a: FA['_A']) => Type<FA[URI_Tag], B>): Type<FA[URI_Tag], B>
export function chain<F, A, B>(fa: HKT<F, A>, f: (a: A) => HKT<F, B>): HKT<F, B> {
  return getChain(fa).chain(fa, f)
}

export function chainC<F extends ChainURIS, A, B>(f: (a: A) => Type<F, B>): Type<F, B>
export function chainC<F, A, B>(f: (a: A) => HKT<F, B>): (fa: HKT<F, A>) => HKT<F, B> {
  return fa => getChain(fa).chain(fa, f)
}

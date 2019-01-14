import { Apply, ApplyURIS, Apply1, isApply } from './Apply'
import { HKT, URI_Tag, Type } from './HKT'

export interface URI2Applicative<A> {}
export type ApplicativeURIS = ApplyURIS & URI2Applicative<any>[keyof URI2Applicative<any>][URI_Tag]

export interface Applicative<F> extends Apply<F> {
  readonly of: <A>(a: A) => HKT<F, A>
}

export interface Applicative1<F extends ApplicativeURIS> extends Apply1<F> {
  readonly of: <A>(a: A) => Type<F, A>
}

export const isApplicative = (f: any): f is Applicative<any> => {
  return isApply(f) && typeof (f as any)['of'] === 'function'
}

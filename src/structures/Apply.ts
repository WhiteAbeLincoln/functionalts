import { Functor, FunctorURIS, Functor1, isFunctor } from './Functor'
import { HKT, URI_Tag, Type } from './HKT'
import { Fn } from '../util/types'
import { getTypeclass } from '../util/util'

export interface URI2Apply<A> {}
export type ApplyURIS = FunctorURIS & URI2Apply<any>[keyof URI2Apply<any>][URI_Tag]

export interface Apply<F> extends Functor<F> {
  readonly ap: <A, B>(fab: HKT<F, Fn<[A], B>>, fa: HKT<F, A>) => HKT<F, B>
}

export interface Apply1<F extends ApplyURIS> extends Functor1<F> {
  readonly ap: <A, B>(fab: Type<F, Fn<[A], B>>, fa: Type<F, A>) => Type<F, B>
}

export const isApply = (f: any): f is Apply<any> => {
  return isFunctor(f) && typeof (f as any)['ap'] === 'function'
}

export const getApply: <F>(fa: HKT<F, any>) => Apply<F> = getTypeclass(isApply, 'Apply')

// If we use Type instead of HKT here, typescript fails to infer. However, since every valid type is an HKT
// this method works. We must have at least one Type<F> though, otherwise typescript infers too far
// making our type parameter F become 'Array' | 'Maybe' for invalid calls
// such as `ap(just((x: string) => x.length), ['hi'])` which gives no error
export function ap<F extends ApplyURIS, A, B>(fab: HKT<F, Fn<[A], B>>, fa: Type<F, A>): Type<F, B>
export function ap<F, A, B>(fab: HKT<F, Fn<[A], B>>, fa: HKT<F, A>): HKT<F, B> {
  return getApply(fab).ap(fab, fa)
}

// here we can use HKT for both parameters, since typescript doesn't do any inference
// past the function boundry - our type parameter F stays restricted to 'Maybe'
// for the invalid call `ap(just((x: string) => x.length))(['hi'])` giving us an error
// however, it's not necessary to use HKT for both, so we'll stick with Type, which gives
// better user ergonomics (vscode shows the actual type name Maybe<string> instead of HKT<'Maybe', string>)
export function apC<F extends ApplyURIS, A, B>(fab: HKT<F, Fn<[A], B>>): (fa: Type<F, A>) => Type<F, B>
export function apC<F, A, B>(fab: HKT<F, Fn<[A], B>>): (fa: HKT<F, A>) => HKT<F, B> {
  return fa => getApply(fab).ap(fab, fa)
}

import { ChainURIS, Chain, Chain1, isChain } from './Chain'
import { ApplicativeURIS, Applicative, Applicative1, isApplicative } from './Applicative'
import { URI_Tag } from './HKT'

export interface URI2Monad<A> {}
export type MonadURIS = ChainURIS & ApplicativeURIS & URI2Monad<any>[keyof URI2Monad<any>][URI_Tag]

// Monad doesn't add any new functions, just laws
export interface Monad<F> extends Applicative<F>, Chain<F> {}
export interface Monad1<F extends MonadURIS> extends Applicative1<F>, Chain1<F> {}

export const isMonad = (a: any): a is Monad<any> => isApplicative(a) && isChain(a)

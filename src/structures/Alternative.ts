import { ApplicativeURIS, Applicative, Applicative1, isApplicative } from './Applicative'
import { PlusURIS, Plus, Plus1, isPlus } from './Plus'
import { URI_Tag } from './HKT'

export interface URI2Alternative<A> {}
export type AlternativeURIS = ApplicativeURIS & PlusURIS & URI2Alternative<any>[keyof URI2Alternative<any>][URI_Tag]

// Alternative doesn't add any new functions, just new laws
export interface Alternative<A> extends Applicative<A>, Plus<A> {}
export interface Alternative1<A extends AlternativeURIS> extends Applicative1<A>, Plus1<A> {}

export const isAlternative = (a: any): a is Alternative<any> => isApplicative(a) && isPlus(a)

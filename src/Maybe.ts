import { HKT, tag, URI_Tag } from './structures/HKT'
import { addFunctor } from './structures/Functor'
import { createRegister } from './util/util'

export const URI = 'functionalts/Maybe/URI'
export type URI = typeof URI

declare module './structures/HKT' {
  interface URI2HKT<A> {
    // if we use a computed property name
    // we get the error 'functionalts/Maybe/URI'
    // does not satisfy the constraint 'functionalts/Array/URI'
    // this is a bug as of typescript 3.2.2
    // TODO: Submit an issue
    'functionalts/Maybe/URI': Maybe<A>
  }
}

export type Maybe<A> = Nothing | Just<A>

const TagJust = Symbol('functionalts/Maybe/TagJust')
const TagNothing = Symbol('functionalts/Maybe/TagNothing')

interface MaybeBase<A> extends HKT<URI, A> {
  readonly [tag]: typeof TagJust | typeof TagNothing
}

export interface Nothing extends MaybeBase<never> {
  readonly _A: never
  readonly [tag]: typeof TagNothing
}

export interface Just<A> extends MaybeBase<A> {
  readonly [tag]: typeof TagJust
  readonly value: A
}

export const nothing: Maybe<never> = Object.freeze({ [tag]: TagNothing, [URI_Tag]: URI }) as Nothing
export const just = <A>(value: A): Maybe<A> => ({ [tag]: TagJust, [URI_Tag]: URI, value }) as unknown as Just<A>

export const isNothing = <A>(m: Maybe<A>): m is Nothing => m[tag] === TagNothing
export const isJust = <A>(m: Maybe<A>): m is Just<A> => m[tag] === TagJust

export const map = <A, B>(fa: Maybe<A>, f: (a: A) => B): Maybe<B> =>
  isJust(fa) ? just(f(fa.value)) : fa

export const mapC = <A, B>(f: (a: A) => B) => (fa: Maybe<A>): Maybe<B> => map(fa, f)

export const Register = createRegister({
  functor: () => addFunctor({ URI, map, mapC })
})

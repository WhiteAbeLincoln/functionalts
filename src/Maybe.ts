import { HKT, tag, URI_Tag } from './structures/HKT'
import { registerInstance } from './structures/register'
import { Functor1 } from './structures/Functor'
import { Alt1 } from './structures/Alt'
import { Plus1 } from './structures/Plus'
import { Apply1 } from './structures/Apply'
import { Fn, Predicate, Refinement, Lazy } from './util/types'
import { Applicative1 } from './structures/Applicative'
import { Chain1 } from './structures/Chain'

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

// This is how you register your object as a Functor
// at the type-level
declare module './structures/Functor' {
  interface URI2Functor<A> {
    'functionalts/Maybe/URI': Maybe<A>
  }
}

declare module './structures/Alt' {
  interface URI2Alt<A> {
    'functionalts/Maybe/URI': Maybe<A>
  }
}

declare module './structures/Plus' {
  interface URI2Plus<A> {
    'functionalts/Maybe/URI': Maybe<A>
  }
}

declare module './structures/Apply' {
  interface URI2Apply<A> {
    'functionalts/Maybe/URI': Maybe<A>
  }
}

declare module './structures/Applicative' {
  interface URI2Applicative<A> {
    'functionalts/Maybe/URI': Maybe<A>
  }
}

declare module './structures/Alternative' {
  interface URI2Alternative<A> {
    'functionalts/Maybe/URI': Maybe<A>
  }
}

declare module './structures/Chain' {
  interface URI2Chain<A> {
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
  isJust(fa) ? just(f(fa.value)) : nothing

export const alt = <A>(fa: Maybe<A>, fb: Maybe<A>): Maybe<A> =>
  isJust(fa) ? fa : fb

export const zero = <A>(): Maybe<A> => nothing

export const ap = <A, B>(fab: Maybe<Fn<[A], B>>, fa: Maybe<A>): Maybe<B> =>
  isNothing(fab) ? nothing : map(fa, fab.value)

export { just as of }

export const chain = <A, B>(fa: Maybe<A>, f: (a: A) => Maybe<B>): Maybe<B> =>
  isNothing(fa) ? nothing : f(fa.value)

export const fromPredicate =
  <A, B extends A = A>(pred: Predicate<A> | Refinement<A, B>) =>
                      (a: A): Maybe<B> => pred(a) ? just(a) : zero()

export const tryCatch = <A>(f: Lazy<A>) => {
  try {
    return just(f())
  } catch {
    return nothing
  }
}

export const fromNullable = <A>(a: A | null | undefined): Maybe<A> =>
  a == null ? nothing : just(a)

type Instances =
  & Functor1<URI>
  & Alt1<URI>
  & Plus1<URI>
  & Apply1<URI>
  & Applicative1<URI>
  & Chain1<URI>

// This is how you register your object at the value-level
export const Register = () =>
  registerInstance<Instances>({
    URI
  , map
  , alt
  , zero
  , ap
  , of: just
  , chain
  })

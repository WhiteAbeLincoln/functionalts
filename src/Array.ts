import { URI_Tag } from './structures/HKT'
import { registerInstance } from './structures/register'
import { Functor1 } from './structures/Functor'
import { Alt1 } from './structures/Alt'
import { Plus1 } from './structures/Plus'
import { Apply1 } from './structures/Apply'
import { Fn } from './util/types'
import { Applicative1 } from './structures/Applicative'
import { Chain1 } from './structures/Chain'
import { equals as equalsG, SetoidTypes, Setoid } from './structures/Setoid'
import { Ord, compare as compareG, OrdTypes, ordNumber } from './structures/Ord'
import { Ordering } from './structures/Ordering'
import { zip } from './Iterable'
import { Monad1 } from './structures/Monad'
import { Semigroup } from './structures/Semigroup'

declare global {
  interface Array<T> {
    [URI_Tag]: 'functionalts/Array/URI'
    _A: T
  }
}

export const URI = 'functionalts/Array/URI'
export type URI = typeof URI

declare module './structures/HKT' {
  interface URI2HKT<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Functor' {
  interface URI2Functor<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Alt' {
  interface URI2Alt<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Plus' {
  interface URI2Plus<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Apply' {
  interface URI2Apply<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Applicative' {
  interface URI2Applicative<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Alternative' {
  interface URI2Alternative<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Chain' {
  interface URI2Chain<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Monad' {
  interface URI2Monad<A> {
    'functionalts/Array/URI': Array<A>
  }
}

declare module './structures/Setoid' {
  interface RegisterSetoid {
    'functionalts/Array/Setoid': Array<any>
  }
}

declare module './structures/Ord' {
  interface RegisterOrd {
    'functionalts/Array/Ord': Array<any>
  }
}

declare module './structures/Semigroup' {
  interface RegisterSemigroup {
    'functionalts/Array/Semigroup': Array<any>
  }
}

let prototypeModified = URI_Tag in []
const modifyPrototype = () => {
  if (!prototypeModified) {
    Array.prototype[URI_Tag as any] = URI
    prototypeModified = true
  }
}

export const map = <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> =>
  fa.map(f)

export const alt = <A>(xs: Array<A>, ys: Array<A>): Array<A> => xs.concat(ys)
export { alt as concat }

export const empty: ReadonlyArray<never> = []

// we return a new array instead of the empty constant above
// just in case someone decides to mutate empty
// this does mean we don't get object equality
// is that important?
export const zero = <A>(): Array<A> => [] // empty

export const flatten = <A>(ffa: A[][]) => ([] as A[]).concat(...ffa)

export const ap = <A, B>(fab: Array<Fn<[A], B>>, fa: Array<A>): Array<B> => {
  return chain(fab, f => map(fa, f))
}

export const of = <A>(a: A): A[] => [a]

export const chain = <A, B>(fa: Array<A>, f: Fn<[A], Array<B>>): Array<B> => flatten(fa.map(f))

const eq =
 <A>(S: { equals: (x: A, y: A) => boolean } = { equals: equalsG }) =>
    (xs: Array<A>, ys: Array<A>): boolean =>
      xs.length === ys.length && xs.every((x, i) => S.equals(x, ys[i]))

export const comp =
   <A>(O: Pick<Ord<A>, 'compare'> = { compare: compareG }) =>
      (xs: Array<A>, ys: Array<A>): Ordering => {
        const xLen = xs.length
        const yLen = ys.length
        for (const [x, y] of zip(xs, ys)) {
          const order = O.compare(x, y)
          // if the elements are not equal return the result
          if (order !== 0) return order
        }
        // if all matching elements are equal compare lengths
        return ordNumber.compare(xLen, yLen)
      }


export function equals<A>(S: Setoid<A>): (xs: Array<A>, ys: Array<A>) => boolean
export function equals<A extends SetoidTypes>(xs: Array<A>, ys: Array<A>): boolean
export function equals(): boolean | (<A>(x: Array<A>, y: Array<A>) => boolean) {
  switch (arguments.length) {
    case 1:
      const S: Setoid<any> = arguments[0]
      return eq(S)
    default:
      const [xs, ys] = arguments
      return eq<any>()(xs, ys)
  }
}

export function compare<A>(S: Ord<A>): (xs: Array<A>, ys: Array<A>) => Ordering
export function compare<A extends OrdTypes>(xs: Array<A>, ys: Array<A>): Ordering
export function compare(): Ordering | (<A>(x: Array<A>, y: Array<A>) => Ordering) {
  switch (arguments.length) {
    case 1:
      const S: Ord<any> = arguments[0]
      return comp(S)
    default:
      const [xs, ys] = arguments
      return comp<any>()(xs, ys)
  }
}

export const getSetoid = <A>(S: Setoid<A>): Setoid<Array<A>> => ({
  equals: eq(S)
})

type Instances =
  & Functor1<URI>
  & Alt1<URI>
  & Plus1<URI>
  & Apply1<URI>
  & Applicative1<URI>
  & Chain1<URI>
  & Monad1<URI>
  & Setoid<Array<SetoidTypes>>
  & Ord<Array<any>>
  & Semigroup<Array<any>>

export const Register = () => (
  modifyPrototype(),
  registerInstance<Instances>({
    URI
  , map
  , alt
  , zero
  , ap
  , of
  , chain
  , equals: eq()
  , compare: comp()
  , concat: alt
  })
)

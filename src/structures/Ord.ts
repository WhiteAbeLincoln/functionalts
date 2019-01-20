import { Setoid, setoidString, setoidNumber, setoidBoolean, isSetoid, getProductSetoid } from './Setoid'
import { Ordering, sign } from './Ordering'
import { Type, URIS, HKT, isHKT, URI_Tag } from './HKT'
import { getTypeclass } from '../util/util'
import { zip } from '../Iterable'
import { Shift } from '../util/types'

export interface RegisterOrd {
  'functionalts/Ord/number': number
  'functionalts/Ord/string': string
  'functionalts/Ord/boolean': boolean
}
export type DistributeTypes<T> =
    T extends Type<URIS, any> ? OrdHKT<T[URI_Tag]>
  : T
export interface OrdHKT<T extends URIS> extends HKT<T, OrdTypes> {}
export type OrdTypes = DistributeTypes<RegisterOrd[keyof RegisterOrd]>

export interface Ord<A> extends Setoid<A> {
  readonly compare: (x: A, y: A) => Ordering
}

export const unsafeCompare = (x: any, y: any): Ordering => x < y ? -1 : x > y ? 1 : 0
export const ordString: Ord<string> = {
  ...setoidString,
  compare: unsafeCompare
}
export const ordNumber: Ord<number> = {
  ...setoidNumber,
  compare: unsafeCompare
}
export const ordBoolean: Ord<boolean> = {
  ...setoidBoolean,
  compare: unsafeCompare
}

export const isOrd = (f: any): f is Ord<any> =>
  isSetoid(f) && typeof (f as any)['compare'] === 'function'

export const dispatchOrd = <F extends OrdTypes>(v: F): Ord<F> => {
  if (typeof v === 'string') return ordString as Ord<F>
  if (typeof v === 'number') return ordNumber as Ord<F>
  if (typeof v === 'boolean') return ordBoolean as Ord<F>
  if (isHKT(v)) return getTypeclass(isOrd, 'Ord')(v)
  throw new Error(`Ord for value ${v} is not registered`)
}

export function compare<A>(O: Ord<A>): (x: A, y: A) => Ordering
export function compare<A extends OrdTypes>(x: A, y: A): Ordering
export function compare(): Ordering | (<A>(x: A, y: A) => Ordering) {
  switch (arguments.length) {
    case 1: {
      const O: Ord<any> = arguments[0]
      return <A>(x: A, y: A) => O.compare(x, y)
    }
    default: {
      const [x, y] = arguments
      return dispatchOrd(x).compare(x, y)
    }
  }
}

export const compareC = <A extends OrdTypes>(x: A) => (y: A): Ordering =>
  dispatchOrd(x).compare(x, y)

export const compareC1 = <A>(O: Ord<A>) => (x: A) => (y: A): Ordering =>
  O.compare(x, y)

export const lessThan = <A>(O: Ord<A>) => (x: A, y: A) => O.compare(x, y) === -1
export const greaterThan = <A>(O: Ord<A>) => (x: A, y: A) => O.compare(x, y) === 1
export const lessThanOrEq = <A>(O: Ord<A>) => (x: A, y: A) => O.compare(x, y) !== 1
export const greaterThanOrEq = <A>(O: Ord<A>) => (x: A, y: A) => O.compare(x, y) !== -1

/**
 * Takes the minimum of two values, returning the first if they are considered equal
 */
export const min = <A>(O: Ord<A>) => (x: A, y: A): A =>
  greaterThan(O)(x, y) ? y : x

/**
 * Takes the maximum of two values, returning the first if they are considered equal
 */
export const max = <A>(O: Ord<A>) => (x: A, y: A): A =>
  lessThan(O)(x, y) ? y : x

/**
 * Clamp a value betwen a minimum and a maximum
 *
 * copied from gcanti/fp-ts
 */
export const clamp = <A>(O: Ord<A>): ((low: A, hi: A) => (x: A) => A) => {
  const minO = min(O)
  const maxO = max(O)
  return (low, hi) => x => maxO(minO(x, hi), low)
}

/**
 * Test whether a value is between a minimum and a maximum (inclusive)
 */
export const between = <A>(O: Ord<A>): ((low: A, hi: A) => (x: A) => boolean) => {
  const lessThanO = lessThanOrEq(O)
  const greaterThanO = greaterThanOrEq(O)
  return (low, hi) => x => greaterThanO(x, low) && lessThanO(x, hi)
}

export const fromCompare = <A>(compare: (x: A, y: A) => Ordering): Ord<A> => ({
  equals: (x, y) => compare(x, y) === 0,
  compare
})

/**
 * Gets an Ord for comparing strings using String.prototype.localeCompare
 * @param opts Any options that can be provided to String.prototype.localeCompare
 */
export const getOrdStringLocale = (...opts: Shift<Parameters<String['localeCompare']>>): Ord<string> =>
  fromCompare((x, y) => sign(x.localeCompare(y, ...opts)))

/**
 * Gets an Ord for comparing strings using Intl.Collator.prototype.compare
 * @param col A Collator object
 */
export const getOrdStringCollator = (col: Intl.Collator): Ord<string> =>
  fromCompare((x, y) => sign(col.compare(x, y)))

type GetOrdType<T> = T extends Ord<infer A> ? A : never

export const getProductOrd =
  <Os extends Array<Ord<any>>>(...ords: Os): Ord<{ [k in keyof Os]: GetOrdType<Os[k]> }> => ({
    ...getProductSetoid(...ords) as any,
    compare: (xs, ys) => {
      let r: Ordering
      // xs, ys, and ords should all have the same length because the types require it
      for (const tuple of zip(xs, ys, ords)) {
        // it would be really nice to introduce a type variable here
        // so I could say xa, ya are type A, and O is Ord<A>, and they wouldn't
        // accept any other types
        // we get around this by saying xa,ya are types that could never exist
        // thereby preventing anything other than xa and ya being passed to O.compare
        type A = 1&0
        const [x, y, O] = tuple as unknown as [A, A, Ord<A>]
        r = O.compare(x, y)
        if (r === 0) continue
        return r
      }
      // a productOrd for the empty tuple (unit) is undefined
      // so we can assert that r will always have a value
      return r!
    }
  })

export const getDualOrd = <A>(O: Ord<A>): Ord<A> =>
  fromCompare((x, y) => O.compare(y, x))

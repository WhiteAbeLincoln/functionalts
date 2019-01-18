import { Setoid, setoidString, setoidNumber, setoidBoolean, isSetoid } from './Setoid'
import { Ordering, sign } from './Ordering'
import { Type, URIS, HKT, isHKT, URI_Tag } from './HKT'
import { getTypeclass } from '../util/util'

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
  compare: (x, y) => sign(x.localeCompare(y))
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

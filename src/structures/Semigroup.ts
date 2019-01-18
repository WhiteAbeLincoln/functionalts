import { Type, URIS, URI_Tag, HKT, isHKT } from './HKT'
import { getTypeclass, iterateObject } from '../util/util'
import { I } from '../util/functional'
import { Fn } from '../util/types'

export interface RegisterSemigroup {
  'functionalts/Semigroup/number': number
  'functionalts/Semigroup/string': string
  'functionalts/Semigroup/boolean': boolean
}

export interface Semigroup<A> {
  readonly concat: (x: A, y: A) => A
}

export type DistributeTypes<T> =
    T extends Type<URIS, any> ? SemigroupHKT<T[URI_Tag]>
  : T
export type SemigroupTypes = DistributeTypes<RegisterSemigroup[keyof RegisterSemigroup]>
export interface SemigroupHKT<T extends URIS> extends HKT<T, SemigroupTypes> {}

export const semigroupAll: Semigroup<boolean> = { concat: (x, y) => x && y }
export const semigroupAny: Semigroup<boolean> = { concat: (x, y) => x || y }
export const semigroupSum: Semigroup<number> = { concat: (x, y) => x + y }
export const semigroupProduct: Semigroup<number> = { concat: (x, y) => x * y }
export const semigroupString: Semigroup<string> = { concat: (x, y) => x + y }
export const semigroupVoid: Semigroup<void> = { concat: () => undefined }

type GetSemigroupType<T> = T extends Semigroup<infer A> ? A : never

export const getProductSemigroup =
  <Ss extends Array<Semigroup<any>>>(...semigroups: Ss): Semigroup<{ [k in keyof Ss]: GetSemigroupType<Ss[k]> }> => ({
    concat: (xs, ys) => {
      if (xs.length !== ys.length || xs.length !== semigroups.length)
        throw new Error('Cannot concat two products having different lengths')
      return xs.map((x, i) => semigroups[i].concat(x, ys[i])) as { [k in keyof Ss]: GetSemigroupType<Ss[k]> }
    }
  })

export const getRecordSemigroup = <O extends Record<any, any>>(
  semigroups: { [K in keyof O]: Semigroup<O[K]> }
): Semigroup<O> => ({
  concat: (x, y) => {
    const ret: O = {} as any
    for (const [key, val] of iterateObject(semigroups)) {
      ret[key] = val.concat(x[key], y[key])
    }
    return ret
  }
})

export const getFunctionSemigroup =
          <S>(S: Semigroup<S>) =>
  <A = never>(): Semigroup<Fn<[A], S>> =>
             ({ concat: (f, g) => a => S.concat(f(a), g(a)) })

export const getDualSemigroup = <A>(S: Semigroup<A>): Semigroup<A> => ({
  concat: (x, y) => S.concat(y, x)
})

export const getFirstSemigroup = <A = never>(): Semigroup<A> => ({
  concat: I
})

export const getLastSemigroup = <A = never>(): Semigroup<A> =>
  ({ concat: (_, y) => y })
  // getDualSemigroup(getFirstSemigroup())

export const isSemigroup = (f: any): f is Semigroup<unknown> =>
  typeof f === 'object' && f !== null && typeof f['concat'] === 'function'

export const dispatchSemigroup = <F extends SemigroupTypes>(v: F): Semigroup<F> => {
  if (typeof v === 'string') return semigroupString as unknown as Semigroup<F>
  if (typeof v === 'number') return semigroupSum as unknown as Semigroup<F>
  if (typeof v === 'boolean') return semigroupAll as unknown as Semigroup<F>
  if (isHKT(v)) return getTypeclass(isSemigroup, 'Semigroup')(v) as Semigroup<F>
  throw new Error(`Semigroup for value ${v} is not registered`)
}

export function concat<A>(S: Semigroup<A>): (x: A, y: A) => A
export function concat<A extends SemigroupTypes>(x: A, y: A): A
export function concat<A>(): A | ((x: A, y: A) => A) {
  switch (arguments.length) {
    case 1: {
      const S: Semigroup<A> = arguments[0]
      return (x: A, y: A) => S.concat(x, y)
    }
    default: {
      const [x, y] = arguments
      return dispatchSemigroup(x).concat(x, y)
    }
  }
}

export const concatC = <A extends SemigroupTypes>(x: A) => (y: A): A =>
  dispatchSemigroup(x).concat(x, y)

export const concatC1 = <A>(S: Semigroup<A>) => (x: A) => (y: A) =>
  S.concat(x, y)

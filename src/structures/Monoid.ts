import {
  Semigroup, getProductSemigroup,
  semigroupAll, semigroupAny, semigroupSum,
  semigroupProduct, semigroupString, semigroupVoid,
  getRecordSemigroup, getFunctionSemigroup, isSemigroup
} from './Semigroup'
import { Type, URIS, URI_Tag, HKT, isHKT } from './HKT'
import { iterateObject, getTypeclass } from '../util/util'
import { Fn } from '../util/types'

export interface RegisterMonoid {
  'functionalts/Monoid/number': number
  'functionalts/Monoid/string': string
  'functionalts/Monoid/boolean': boolean
}

export interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}

export type DistributeTypes<T> =
    T extends Type<URIS, any> ? MonoidHKT<T[URI_Tag]>
  : T
export type MonoidTypes = DistributeTypes<RegisterMonoid[keyof RegisterMonoid]>
export interface MonoidHKT<T extends URIS> extends HKT<T, MonoidTypes> {}

type GetMonoidType<T> = T extends Monoid<infer A> ? A : never

export const monoidAll: Monoid<boolean> = ({
  ...semigroupAll,
  empty: true
})

export const monoidAny: Monoid<boolean> = ({
  ...semigroupAny,
  empty: false
})

export const monoidSum: Monoid<number> = ({
  ...semigroupSum,
  empty: 0
})

export const monoidProduct: Monoid<number> = ({
  ...semigroupProduct,
  empty: 1
})

export const monoidString: Monoid<string> = ({
  ...semigroupString,
  empty: ''
})

export const monoidVoid: Monoid<void> = ({
  ...semigroupVoid,
  empty: undefined
})

export const getProductMonoid =
  <Ss extends Array<Monoid<any>>>(...monoids: Ss): Monoid<{ [k in keyof Ss]: GetMonoidType<Ss[k]> }> => ({
    ...getProductSemigroup(...monoids) as any,
    empty: monoids.map(M => M.empty) as { [k in keyof Ss]: GetMonoidType<Ss[k]> }
  })

export const getRecordMonoid = <O extends Record<any, any>>(
  monoids: { [K in keyof O]: Monoid<O[K]> }
): Monoid<O> => {
  const empty: O = {} as any
  for (const [key, val] of iterateObject(monoids)) {
    empty[key] = val.empty
  }
  return {
    ...getRecordSemigroup(monoids),
    empty
  }
}

export const getFunctionMonoid =
          <M>(M: Monoid<M>) =>
  <A = never>(): Monoid<Fn<[A], M>> =>
            ({ ...getFunctionSemigroup(M)<A>(), empty: () => M.empty })


export const isMonoid = (f: any): f is Monoid<unknown> =>
  isSemigroup(f) && 'empty' in f

export const dispatchMonoid = <F extends MonoidTypes>(v: F): Monoid<F> => {
  if (typeof v === 'string') return monoidString as unknown as Monoid<F>
  // There really isn't a way to ensure this stays consistent with dispatchSemigroup behavior
  if (typeof v === 'number') return monoidSum as unknown as Monoid<F>
  if (typeof v === 'boolean') return semigroupAll as unknown as Monoid<F>
  if (isHKT(v)) return getTypeclass(isMonoid, 'Monoid')(v) as Monoid<F>
  throw new Error(`Monoid for value ${v} is not registered`)
}

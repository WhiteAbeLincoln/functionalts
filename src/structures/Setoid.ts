import { iterateObject, getTypeclass } from '../util/util'
import { every } from '../Iterable'
import { Type, URIS, HKT, isHKT, URI_Tag } from './HKT'

// must be exported or else SetoidTypes cannot be extended
export interface RegisterSetoid {
  'functionalts/Setoid/number': number
  'functionalts/Setoid/string': string
  'functionalts/Setoid/boolean': boolean
  'functionalts/Setoid/symbol': symbol
}

export interface Setoid<A> {
  readonly equals: (x: A, y: A) => boolean
}

export const strictEqual = <A>(x: A, y: A): boolean => x === y
export const setoidStrict = { equals: strictEqual }

export type DistributeTypes<T> =
    T extends Type<URIS, any> ? SetoidHKT<T[URI_Tag]>
  : T
export type SetoidTypes = DistributeTypes<RegisterSetoid[keyof RegisterSetoid]>
export interface SetoidHKT<T extends URIS> extends HKT<T, SetoidTypes> {}

export const setoidString: Setoid<string> = setoidStrict
export const setoidNumber: Setoid<number> = setoidStrict
export const setoidBoolean: Setoid<boolean> = setoidStrict
export const setoidSymbol: Setoid<symbol> = setoidStrict

type GetSetoidType<T> = T extends Setoid<infer A> ? A : never

export const getProductSetoid =
  <Ss extends Array<Setoid<any>>>(...setoids: Ss): Setoid<{ [k in keyof Ss]: GetSetoidType<Ss[k]> }> => ({
    equals: (xs, ys) =>
        xs.length === ys.length
     && xs.length === setoids.length
     && xs.every((x, i) => setoids[i].equals(x, ys[i]))
  })

export const getRecordSetoid = <O extends Record<any, any>>(
  setoids: { [K in keyof O]: Setoid<O[K]> }
): Setoid<O> => ({
  equals: (x, y) =>
    every(
      iterateObject(setoids)
    , ([key, value]) => value.equals(x[key], y[key])
    )
})

export const isSetoid = (f: any): f is Setoid<unknown> =>
  typeof f === 'object' && f !== null && typeof f['equals'] === 'function'

export const dispatchSetoid = <F extends SetoidTypes>(v: F): Setoid<F> => {
  if ( typeof v === 'string'
    || typeof v === 'number'
    || typeof v === 'boolean'
    || typeof v === 'symbol'
    ) { return setoidStrict as Setoid<F> }
  if (isHKT(v)) return getTypeclass(isSetoid, 'Setoid')(v)
  throw new Error(`Setoid for value ${v} is not registered`)
}

export function equals<A>(S: Setoid<A>): (x: A, y: A) => boolean
export function equals<A extends SetoidTypes>(x: A, y: A): boolean
export function equals<A>(): boolean | ((x: A, y: A) => boolean) {
  switch (arguments.length) {
    case 1: {
      const S: Setoid<A> = arguments[0]
      return (x: A, y: A) => S.equals(x, y)
    }
    default: {
      const [x, y] = arguments
      return dispatchSetoid(x).equals(x, y)
    }
  }
}

export const equalsC = <A extends SetoidTypes>(x: A) => (y: A): boolean =>
  dispatchSetoid(x).equals(x, y)

export const equalsC1 = <A>(S: Setoid<A>) => (x: A) => (y: A): boolean =>
  S.equals(x, y)

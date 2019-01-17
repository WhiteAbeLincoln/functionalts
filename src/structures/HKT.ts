import { The } from '../util/types'

/*
 * Credit goes to gcanti (https://github.com/gcanti/fp-ts) and the authors of
 * "Lightweight higher-kinded polymorphism" (https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf)
 * for the idea and implementation of the HKT interface
 */

/** used on union types to discriminate */
export const tag = Symbol('functionalts/HKT/tag')
/** used to discriminate between different higher kinded types */
// Currently with typescript 3.2.2 there are bugs when using
// computed symbols as keys and interface/module augmentation
// so we have to fall back to a scoped string
// TODO: Submit issue
export const URI_Tag = '@@functionalts/HKT/URI_Tag'
export type URI_Tag = typeof URI_Tag

export const getTagValue = <F, A>(fa: HKT<F, A>): F | undefined => {
  const tag: F | undefined = fa[URI_Tag]
  return tag
  // if (typeof tag !== 'undefined') return tag
  // we have a special case for iterables, since we can't modify
  // all prototypes conforming to the iterable protocol
  // if (typeof (fa as any)[Symbol.iterator] === 'function')
  //   return IterURI as unknown as F

  // return tag
}

export interface HKT<URI, A> {
  /** A field used to discriminate on first-order HKTs */
  readonly [URI_Tag]: URI
  /** A phantom field used to store the type */
  readonly _A: A
}

export const isHKT = (a: any): a is HKT<any, any> =>
  typeof a === 'object' && a !== null && typeof a[URI_Tag] !== 'undefined'

// I think the proper way to do this would be a mapped type:
// { [x: symbol]: any }
// however, as of 3.2.2 typescript cannot use symbols as indexes
// see https://github.com/Microsoft/TypeScript/issues/24587
// https://github.com/Microsoft/TypeScript/issues/1863
// https://github.com/Microsoft/TypeScript/pull/26797
// I'm not even sure if this is doing anything
// typescript seems to think the type is '{}'
// type URI2HKTBase = { [x in symbol]: any }

// type-level dictionaries for HKTs
// see https://github.com/gcanti/fp-ts/blob/e31a386c834934862db68f69b0d6039ba12d8b0c/src/HKT.ts
export interface URI2HKT<A> {}

export type URIS = /*
  keyof URI2HKT<any>
  /*/
  URI2HKT<any>[keyof URI2HKT<any>][typeof URI_Tag]
  //*/

export type Type<URI extends URIS, A> = URI2HKT<A>[URI]

// Type-level integrity checks
/** @ignore */
export type URI2HKT_Integrity = The<{ [k in keyof URI2HKT<any>]: HKT<k, any> }, URI2HKT<any>>

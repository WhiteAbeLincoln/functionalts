import { HKT, URIS, Type, URI_Tag } from './HKT'

export interface Functor<F> {
  readonly URI: F
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
  readonly mapC: <A, B>(f: (a: A) => B) => (fa: HKT<F, A>) => HKT<F, B>
}

export interface Functor1<F extends URIS> {
  readonly URI: F
  readonly map: <A, B>(fa: Type<F, A>, f: (a: A) => B) => Type<F, B>
  readonly mapC: <A, B>(f: (a: A) => B) => (fa: Type<F, A>) => Type<F, B>
}

const functorMap = new Map<any, Functor<any>>()

export function getFunctor<F>(f: F): Functor<F> | undefined {
  return functorMap.get(f)
}

export function addFunctor<URI extends URIS>(fmodule: Functor1<URI>): void
export function addFunctor<F>(fmodule: Functor<F>): void {
  functorMap.set(fmodule.URI, fmodule)
}

export function map<FA extends Type<URIS, any>, B>(fa: FA, f: (a: FA['_A']) => B): Type<FA[typeof URI_Tag], B>
export function map<F, A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B>
export function map<F, A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B> {
  // when recieve a fa value, look up it's HKT tag in the functor table
  // this gives the specific map function that operates on that HKT
  const tag = fa[URI_Tag]
  const fmodule = getFunctor(tag)
  if (typeof fmodule === 'undefined') {
    throw new Error(`Functor Module for HKT with tag ${tag} is not registered`)
  }
  return fmodule.map(fa, f)
}

export function mapC<FA extends Type<URIS, any>, B>(f: (a: FA['_A']) => B): (fa: FA) => Type<FA[typeof URI_Tag], B>
export function mapC<F, A, B>(f: (a: A) => B): (fa: HKT<F, A>) => HKT<F, B>
export function mapC<F, A, B>(f: (a: A) => B): (fa: HKT<F, A>) => HKT<F, B> {
  return fa => map<F, A, B>(fa, f)
}

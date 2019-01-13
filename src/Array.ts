import { URI_Tag } from './structures/HKT'
import { registerInstance } from './structures/register'
import { Functor1 } from './structures/Functor'
import { Alt1 } from './structures/Alt'
import { Plus1 } from './structures/Plus'
import { Apply1 } from './structures/Apply'
import { Fn } from './util/types'

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

let prototypeModified = URI_Tag in []
const modifyPrototype = () => {
  if (!prototypeModified) {
    Array.prototype[URI_Tag as any] = URI
    prototypeModified = true
  }
}

export const map = <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> =>
  fa.map(f)

// TODO: Test the speed of this function (taken from fp-ts) vs other methods of concating arrays
export const alt = <A>(xs: Array<A>, ys: Array<A>): Array<A> => {
  const lenx = xs.length
  const leny = ys.length
  const r = Array(lenx + leny)
  for (let i = 0; i < lenx; ++i) {
    r[i] = xs[i]
  }
  for (let i = 0; i < leny; ++i) {
    r[i + lenx] = ys[i]
  }
  return r
}

export { alt as concat }

export const empty: ReadonlyArray<never> = []

// we return a new array instead of the empty constant above
// just in case someone decides to mutate empty
// this does mean we don't get object equality
// is that important?
export const zero = <A>(): Array<A> => [] // empty

export const flatten: <A>(ffa: Array<Array<A>>) => Array<A>
  = Array.prototype.flat
  ? ffa => ffa.flat(1)
  : ffa => {
    // credit to gcanti - from fp-ts
    // TODO: check if this is significantly faster than concat
    // return [].concat(...ffa) // should work
    let rLen = 0
    const len = ffa.length
    for (let i = 0; i < len; i++) {
      rLen += ffa[i].length
    }
    const r = Array(rLen)
    let start = 0
    for (let i = 0; i < len; i++) {
      const arr = ffa[i]
      const l = arr.length
      for (let j = 0; j < l; j++) {
        r[j + start] = arr[j]
      }
      start += l
    }
    return r
  }

export const ap = <A, B>(fab: Array<Fn<[A], B>>, fa: Array<A>): Array<B> => {
  return chain(fab, f => map(fa, f))
}

export const chain: <A, B>(fa: Array<A>, f: (a: A) => Array<B>) => Array<B>
  = Array.prototype.flatMap
  ? (fa, f) => fa.flatMap(f)
  : (fa, f) => {
    // credit to gcanti - from fp-ts
    // TODO: check if this is significantly faster than map followed by flatten
    let resLen = 0
    const l = fa.length
    const temp = new Array(l)
    for (let i = 0; i < l; i++) {
      const e = fa[i]
      const arr = f(e)
      resLen += arr.length
      temp[i] = arr
    }
    const r = Array(resLen)
    let start = 0
    for (let i = 0; i < l; i++) {
      const arr = temp[i]
      const l = arr.length
      for (let j = 0; j < l; j++) {
        r[j + start] = arr[j]
      }
      start += l
    }
    return r
  }

export const Register = () => (
  modifyPrototype(),
  registerInstance<Functor1<URI> & Alt1<URI> & Plus1<URI> & Apply1<URI>>({
    URI
  , map
  , alt
  , zero
  , ap
  })
)

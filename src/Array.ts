import { URI_Tag } from './structures/HKT'
import { registerInstance } from './structures/register'

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

let prototypeModified = URI_Tag in []
const modifyPrototype = () => {
  if (!prototypeModified) {
    Array.prototype[URI_Tag as any] = URI
    prototypeModified = true
  }
}

export const map = <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> =>
  fa.map(a => f(a))

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

export const Register = () => (modifyPrototype(), registerInstance({
    URI
  , map
  , alt
  }))

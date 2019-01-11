import { URI_Tag } from "./structures/HKT"
import { createRegister } from "./util/util"
import { addFunctor } from "./structures/Functor"

export const URI = 'functionalts/Array/URI'
export type URI = typeof URI

declare module './structures/HKT' {
  interface URI2HKT<A> {
    [URI]: Array<A>
  }
}

declare global {
  interface Array<T> {
    [URI_Tag]: URI
    _A: T
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

export const mapC = <A, B>(f: (a: A) => B) => (fa: Array<A>): Array<B> =>
  map(fa, f)


export const Register = createRegister({
  functor: () => (modifyPrototype(), addFunctor({ URI, map, mapC }))
})

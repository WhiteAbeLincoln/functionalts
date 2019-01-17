import { Fn, Predicate, Refinement } from './util/types'

export function* map<A, B>(xs: Iterable<A>, fn: Fn<[A], B>): Iterable<B> {
  for (const x of xs) {
    yield fn(x)
  }
}

export const every = <A, B extends A = A>(xs: Iterable<A>, pred: Predicate<A> | Refinement<A, B>): xs is Iterable<B> => {
  for (const x of xs) {
    if (!pred(x)) return false
  }

  return true
}

export const some = <A>(xs: Iterable<A>, pred: Predicate<A>) => {
  for (const x of xs) {
    if (pred(x)) return true
  }
  return false
}

export function* zip<
  As extends Array<Iterable<any>>
>(...xss: As): Iterable<{ [k in keyof As]: As[k] extends Iterable<infer A> ? A : never }> {
  const iterators = xss.map(i => i[Symbol.iterator]())
  let done = false

  loop:
  while (!done) {
    const tuple = Array(iterators.length)
    for (const idx of iterators.keys()) {
      const it = iterators[idx]
      const r = it.next()
      if (r.done) {
        done = true
        break loop
      }

      tuple[idx] = r.value
    }

    yield tuple as any
  }
}

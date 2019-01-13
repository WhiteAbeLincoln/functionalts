import { Fn, Predicate, Refinement } from './util/types'

export function* map<A, B>(xs: Iterable<A>, f: Fn<[A], B>) {
  for (const x of xs) {
    yield f(x)
  }
}

export function* filter<A, B extends A = A>(
  xs: Iterable<A>,
  p: Refinement<A, B> | Predicate<A>
): IterableIterator<B> {
  for (const x of xs) {
    if (p(x)) yield x
  }
}

export function* alt<A>(xs: Iterable<A>, ys: Iterable<A>) {
  yield* xs
  yield* ys
}

export function* zero<A>(): IterableIterator<A> {}

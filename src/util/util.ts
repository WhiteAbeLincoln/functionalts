import { Refinement } from './types'
import { HKT, getTagValue } from '../structures/HKT'
import { getInstance } from '../structures/register'
import { tuple } from './functional'

/** @ignore */
export const getTypeclass = <TClass>(pred: Refinement<any, TClass>, name: string) =>
  <F>(fa: HKT<F, any>): TClass => {
    const tag = getTagValue(fa)
    const inst = getInstance(tag)

    if (!inst)
      throw new Error(`${name} Module for HKT with tag ${tag} is not registered`)

    if (!pred(inst))
      throw new Error(`A Module for HKT with tag ${tag} is registered, but doesn't comply with ${name}`)

    return inst
  }

export function* iterateObject<O>(obj: O): IterableIterator<[keyof O, O[keyof O]]> {
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      yield tuple(k, obj[k])
    }
  }
  for (const k of Object.getOwnPropertySymbols(obj)) {
    if (obj.hasOwnProperty(k)) {
      yield tuple(k, (obj as any)[k]) as [keyof O, O[keyof O]]
    }
  }
}

import { Refinement } from './types'
import { HKT, getTagValue } from '../structures/HKT'
import { getInstance } from '../structures/register'

export const getTypeclass = <TClass extends { URI: any }>(pred: Refinement<any, TClass>, name: string) =>
  <F>(fa: HKT<F, any>): TClass => {
    const tag = getTagValue(fa)
    const inst = getInstance(tag)

    if (!inst)
      throw new Error(`${name} Module for HKT with tag ${tag} is not registered`)

    if (!pred(inst))
      throw new Error(`A Module for HKT with tag ${tag} is registered, but doesn't comply with ${name}`)

    return inst
  }

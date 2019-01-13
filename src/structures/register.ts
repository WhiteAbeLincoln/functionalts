import { Functor, Functor1 } from './Functor'
import { Alt, Alt1 } from './Alt'
import { URI_Tag } from './HKT'

/**
 * The map where all our structure instances get stored
 * Keys are the URIS for an instance, values are records of free functions
 * which operate on the type
 */
const instanceMap = new Map<any, { [URI_Tag]: any, [x: string]: (...args: any) => any }>()

/**
 * Registers an instance of a Typeclass (is that the correct term?)
 * @param instance the instance
 */
export function registerInstance<I extends Functor1<any> | Alt1<any>>(instance: I): void
export function registerInstance<F>(instance: Functor<F> | Alt<F>): void
export function registerInstance<F>(instance: Functor<F> | Alt<F>): void {
  const URI = instance.URI

  // throw early (at beginning of program) rather than at access
  if (typeof URI === 'undefined')
    throw new Error('Attempted to register an instance without a URI')

  instanceMap.set(URI, instance as any)
}

export const getInstance = <URI>(uri: URI) => instanceMap.get(uri)

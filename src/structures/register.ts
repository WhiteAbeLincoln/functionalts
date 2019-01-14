/**
 * The map where all our structure instances get stored
 * Keys are the URIS for an instance, values are records of free functions
 * which operate on the type
 */
const instanceMap = new Map<any, { URI: any, [x: string]: (...args: any) => any }>()

/**
 * Registers an instance of a Typeclass (is that the correct term?)
 * @param instance the instance
 */
export function registerInstance<I extends { URI: any }>(instance: I): void {
  const URI = instance.URI

  // throw early (at beginning of program) rather than at access
  if (typeof URI === 'undefined')
    throw new Error('Attempted to register an instance without a URI')

  instanceMap.set(URI, instance)
}

export const getInstance = <URI>(uri: URI) => instanceMap.get(uri)

/**
 * The map where all our structure instances get stored
 * Keys are the URIS for an instance, values are records of free functions
 * which operate on the type
 */
const instanceMap: Record<any, { URI: any, [x: string]: (...args: any) => any }> = {}

export const isTypeclass = (f: any): f is { URI: any } => {
  return typeof f === 'object' && f !== null && typeof f['URI'] !== 'undefined'
}

/**
 * Registers an instance of a Typeclass (is that the correct term?)
 * @param instance the instance
 */
export function registerInstance<I extends { URI: any }>(instance: I): void {
  const URI = instance.URI

  // throw early (at beginning of program) rather than at access
  if (typeof URI === 'undefined')
    throw new Error('Attempted to register an instance without a URI')

  instanceMap[URI] = instance
}

export const getInstance = <URI>(uri: URI): typeof instanceMap[URI] | undefined => instanceMap[uri]

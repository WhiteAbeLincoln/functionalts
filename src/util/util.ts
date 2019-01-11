type RegisterMap = { [k in 'functor']?: () => void }
export const createRegister = <Map extends RegisterMap>(map: Map): Map & { 'all': () => void } => {
  (map as Map & { 'all': () => void })['all'] = () => {
    for (const key in map) {
      if (map.hasOwnProperty(key) && key !== 'all') {
        const fn = map[key]
        if (typeof fn === 'function') fn()
      }
    }
  }

  return map as Map & { 'all': () => void }
}

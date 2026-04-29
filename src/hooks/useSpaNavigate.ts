import { useCallback, useContext } from 'react'

import { UNSAFE_NavigationContext } from 'react-router-dom'

export function useSpaNavigate() {
  const navigationContext = useContext(UNSAFE_NavigationContext)

  return useCallback(
    (path: string) => {
      if (navigationContext) {
        navigationContext.navigator.push(path)
        return
      }

      if (typeof window === 'undefined') {
        return
      }

      const nextHash = path.startsWith('#') ? path : `#${path}`
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`
      window.history.pushState(null, '', nextUrl)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    },
    [navigationContext],
  )
}

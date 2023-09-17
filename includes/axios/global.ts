import globalify from 'base/globalify'

import * as module from '.'

globalify({ axios: module.default })

declare global {
    const axios: typeof module.default
}

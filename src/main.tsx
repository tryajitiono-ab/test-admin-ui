import './index.css'
import { module } from './module.tsx'

module.mount(document.getElementById('root')!, { namespace: import.meta.env.AGS_NAMESPACE })

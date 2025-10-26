import { useEffect } from 'react'
import { useSession } from '../../stores/session'

export default function SessionBoot() {
  const { refresh } = useSession()
  useEffect(() => { refresh() }, [])
  return null
}

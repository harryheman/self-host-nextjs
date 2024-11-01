'use client'

import { useState, useEffect } from 'react'

export function FreshnessTimer({ generatedAt }: { generatedAt: number }) {
  const [secondsElapsed, setSecondsElapsed] = useState<number | null>(null)

  useEffect(() => {
    const updateTimer = () => {
      setSecondsElapsed(Math.floor((Date.now() - generatedAt) / 1000))
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [generatedAt])

  if (!secondsElapsed) return null

  return (
    <p>
      Данные были обновлены{' '}
      {`${secondsElapsed} секунд${secondsElapsed === 1 ? 'у' : '(ы)'}`} назад.
    </p>
  )
}

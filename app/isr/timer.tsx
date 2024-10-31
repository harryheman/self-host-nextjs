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

  return (
    <p>
      Данные не актуализировались в течение:{' '}
      {Boolean(secondsElapsed)
        ? `${secondsElapsed} секунд${secondsElapsed === 1 ? 'ы' : ''}`
        : ''}
    </p>
  )
}

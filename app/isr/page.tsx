import { revalidatePath } from 'next/cache'
import { FreshnessTimer } from './timer'

async function revalidateAction() {
  'use server'
  revalidatePath('/isr')
}

async function getPokemon() {
  const randomId = Math.floor(Math.random() * 151) + 1
  const res = await fetch(`https://api.vercel.app/pokemon/${randomId}`, {
    next: { revalidate: 10 },
  })
  return res.json()
}

export default async function ISRDemo() {
  const pokemon = await getPokemon()
  const generatedAt = Date.now()

  return (
    <div>
      <h1>Демо ISR</h1>
      <p>Идентификатор покемона: {pokemon.id}</p>
      <p>Имя: {pokemon.name}</p>
      <p>Типы: {pokemon.type.join(', ')}</p>
      <FreshnessTimer generatedAt={generatedAt} />
      <form action={revalidateAction}>
        <button type='submit'>Обновить</button>
      </form>
    </div>
  )
}

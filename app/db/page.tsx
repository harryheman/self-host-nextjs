import { addTodoAction, deleteTodoAction } from './actions'
import prisma from './prisma'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const todoList = await prisma.todo.findMany({
    orderBy: { created_at: 'desc' },
  })

  return (
    <div>
      <h1>Список задач</h1>
      <form action={addTodoAction}>
        <input type='text' name='content' required />
        <button type='submit'>Добавить</button>
      </form>
      <ul>
        {todoList.map((todo) => (
          <li key={todo.id}>
            <span style={{ marginRight: '10px' }}>{todo.content}</span>
            <form action={deleteTodoAction} style={{ display: 'inline' }}>
              <input type='hidden' value={todo.id} name='id' />
              <button type='submit'>Удалить</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}

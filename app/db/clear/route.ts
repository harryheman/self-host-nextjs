import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '../prisma'

export async function POST() {
  // Удаляем задачи, поскольку мы не можем доверять
  // доступному любому пользователю Интернета <input>
  await prisma.todo.deleteMany()
  revalidatePath('/db')

  return NextResponse.json({ message: 'Все задачи успешно удалены' })
}

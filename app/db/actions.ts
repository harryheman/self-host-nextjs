'use server'

import { revalidatePath } from 'next/cache'
import prisma from './prisma'

// Добавляет задачу в базу данных
export async function addTodoAction(formData: FormData) {
  const content = formData.get('content') as string
  await prisma.todo.create({ data: { content } })
  revalidatePath('/db')
}

// Удаляет задачу из базы данных
export async function deleteTodoAction(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.todo.delete({
    where: {
      id,
    },
  })
  revalidatePath('/db')
}

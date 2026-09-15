import { prisma } from './db'

async function main() {
  console.log('Performing CRUD operations...')

  const timestamp = Date.now()

  const newUser = await prisma.user.create({
    data: {
      xId: `example-${timestamp}`,
      xUsername: 'Alice',
      xHandle: `alice-${timestamp}`,
    },
  })
  console.log('CREATE:', newUser)

  const foundUser = await prisma.user.findUnique({ where: { id: newUser.id } })
  console.log('READ:', foundUser)

  const updatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { xUsername: 'Alice Smith' },
  })
  console.log('UPDATE:', updatedUser)

  await prisma.user.delete({ where: { id: newUser.id } })
  console.log('DELETE: User deleted.')

  console.log('CRUD operations completed successfully.')
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

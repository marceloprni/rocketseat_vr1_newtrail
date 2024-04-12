import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exit'

async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, res) => {
    console.log(`[${req.method}]-${req.url}`)
  })

  app.get('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()

    return { transactions }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const getTransactionParamsSchema = z.object({ id: z.string().uuid() })
    const { id } = getTransactionParamsSchema.parse(req.params)

    const transactions = await knex('transactions').where('id', id).first()

    return { transactions }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/transactions',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return res.status(201).send()
  })
}

// async function researchRoutes(app: FastifyInstance) {
//  app.get('/research', async () => {
//    const retuner = await knex('transactions').select('*')
//    return retuner
//  })
// }
//
// async function transferredRoutes(app: FastifyInstance) {
//  app.get('/transferred', async () => {
//    const transactions = await knex('transactions')
//      .insert({
//        id: crypto.randomUUID(),
//        title: 'Transação de teste',
//        amount: 1000,
//      })
//      .returning('*')
//
//    return transactions
//  })
// }

export { transactionsRoutes }

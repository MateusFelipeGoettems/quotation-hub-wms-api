import fp from 'fastify-plugin'
import postgres from 'postgres'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    sql: postgres.Sql
  }
}

async function dbPlugin(fastify: FastifyInstance) {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })

  // Test connection on startup
  try {
    await sql`SELECT 1`
    fastify.log.info('Database connected successfully')
  } catch (error) {
    fastify.log.error('Failed to connect to database')
    throw error
  }

  fastify.decorate('sql', sql)

  fastify.addHook('onClose', async () => {
    await sql.end()
    fastify.log.info('Database connection closed')
  })
}

export default fp(dbPlugin, {
  name: 'db',
})

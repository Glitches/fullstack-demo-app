import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyMySQL from 'fastify-mysql'
import { MySQLPromiseConnection } from 'fastify-mysql'

declare module 'fastify' {
    interface FastifyInstance {
        mysql: MySQLPromiseConnection
    }
}

interface PostUserBody {
    name: string
    last_name: string
}

interface GetUserParams {
    id: number
}

const server = fastify()

const MYSQL_DATABASE = process.env.MYSQL_DATABASE
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_HOST = process.env.MYSQL_HOST
const MYSQL_PORT = process.env.MYSQL_PORT

server.register(fastifyCors, {
    allowedHeaders: '*',
})

server.register(fastifyMySQL, {
    promise: true,
    type: 'connection',
    connectionString: `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`,
})

server.get('/health', async (_req, reply) => {
    reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ hello: 'world' })
})

server.get('/user/:id', async (req, _reply) => {
    const connection = server.mysql
    server.log.info((req.params as GetUserParams).id)
    const [rows] = await connection.query('SELECT id, name, last_name FROM demo WHERE id=?', [
        (req.params as GetUserParams).id,
    ])
    return rows
})

server.post('/user', async (req, reply) => {
    const body = req.body as PostUserBody
    if (body.name === undefined) {
        throw new Error('bad body')
    }
    if (body.name === undefined) {
        throw new Error('bad body')
    }

    const connection = server.mysql
    const result = await connection.query('INSERT INTO demo (name,last_name) VALUES (?, ?)', [
        body.name,
        body.last_name,
    ])

    reply.status(200).header('Content-Type', 'application/json; charset=utf-8').send(result)
})

server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        // eslint-disable-next-line no-console
        console.error('There was an an error on listening: ', err)
        // eslint-disable-next-line no-process-exit
        process.exit()
    }

    // eslint-disable-next-line no-console
    console.log(`Server listening at ${address}`)
})

import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyMySQL from 'fastify-mysql'
import { MySQLPromiseConnection } from 'fastify-mysql'

declare module 'fastify' {
    interface FastifyInstance {
        mysql: MySQLPromiseConnection
    }
}

const server = fastify()

server.register(fastifyCors, {
    allowedHeaders: '*',
})

server.register(fastifyMySQL, {
    promise: true,
    type: 'connection',
    connectionString: 'mysql://user:example-user-password@db-mysql:3306/example-db',
})

interface params {
    id: number
}

server.get('/health', async (req, reply) => {
    reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ hello: 'world' })
})

server.get('/user/:id', async (req, _reply) => {
    const connection = await server.mysql
    server.log.info((req.params as params).id)
    const [rows] = await connection.query('SELECT id, name, last_name FROM demo WHERE id=?', [
        (req.params as params).id,
    ])
    return rows
})

interface PostBody {
    name: string
    last_name: string
}

server.post('/user', async (req, reply) => {
    const body = req.body as PostBody
    if (body.name === undefined) {
        throw new Error('bad body')
    }
    if (body.name === undefined) {
        throw new Error('bad body')
    }
    const connection = await server.mysql
    const result = await connection.query('INSERT INTO demo (name,last_name) VALUES (?, ?)', [
        body.name,
        body.last_name,
    ])

    reply.status(200).header('Content-Type', 'application/json; charset=utf-8').send(result)
})
server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        server.log.error(err)
        server.close()
    }
    server.log.info(`Server listening at ${address}`)
})

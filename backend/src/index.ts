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

server.get('/user/:id', async (req, _reply) => {
    const connection = await server.mysql
    console.log((req.params as params).id)
    const [rows, fields] = await connection.query('SELECT id, name, last_name FROM demo WHERE id=?', [
        (req.params as params).id,
    ])
    return rows
})

server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

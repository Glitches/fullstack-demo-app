import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyMySQL from 'fastify-mysql'
import { MySQLPromiseConnection } from 'fastify-mysql'
import { routes } from './routes'

declare module 'fastify' {
    interface FastifyInstance {
        mysql: MySQLPromiseConnection
    }
}

const MYSQL_DATABASE = process.env.MYSQL_DATABASE
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_HOST = process.env.MYSQL_HOST
const MYSQL_PORT = process.env.MYSQL_PORT

const server = fastify({
    logger: {
        prettyPrint:
            process.env.NODE_ENV === 'development'
                ? {
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname',
                  }
                : false,
    },
})

server.register(fastifyCors, {
    allowedHeaders: '*',
})

server.register(fastifyMySQL, {
    promise: true,
    type: 'connection',
    connectionString: `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`,
})

server.register(routes, { prefix: '/api' })

server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        server.log.error('There was an an error on listening: ', err)
        // eslint-disable-next-line no-process-exit
        process.exit()
    }

    server.log.info(`Server listening at ${address}`)
})

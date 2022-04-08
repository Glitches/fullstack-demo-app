import { FastifyInstance, FastifyPluginOptions, RawReplyDefaultExpression, RawRequestDefaultExpression } from 'fastify'
import { Server } from 'http'

interface PostUserBody {
    name: string
    last_name: string
}

interface GetUserParams {
    id: number
}

export async function routes(
    server: FastifyInstance<Server, RawRequestDefaultExpression<Server>, RawReplyDefaultExpression<Server>>,
    _options: FastifyPluginOptions
) {
    server.get('/health', async (_req, reply) => {
        server.log.info('Healty')
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
        server.log.info(body)
        if (body.name === undefined) {
            throw new Error('bad body')
        }
        if (body.name === undefined) {
            throw new Error('bad body')
        }

        const connection = server.mysql

        await connection.query('INSERT INTO demo (name,last_name) VALUES (?, ?)', [body.name, body.last_name])

        reply.status(200).header('Content-Type', 'application/json; charset=utf-8').send({
            data: body,
        })
    })
}

import { FastifyInstance, FastifyPluginOptions, RawReplyDefaultExpression, RawRequestDefaultExpression } from 'fastify'
import * as TE from 'fp-ts/TaskEither'
import { identity, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { Server } from 'http'

const postUserBodyCodec = t.type({
    name: t.string,
    last_name: t.string,
})

const getUserParamsCodec = t.type({
    id: t.number,
})

export async function routes(
    server: FastifyInstance<Server, RawRequestDefaultExpression<Server>, RawReplyDefaultExpression<Server>>,
    _options: FastifyPluginOptions
): Promise<void> {
    server.get('/health', async (_req, reply) => {
        server.log.info('Healty')
        reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ healt: 'Healty' })
    })

    server.get('/user/:id', async (req, _reply) => {
        const connection = server.mysql
        const id = getUserParamsCodec.decode(req.params)

        server.log.info(`Requested Id: ${id}`)

        const [rows] = await connection.query('SELECT id, name, last_name FROM demo WHERE id=?', [id])

        server.log.info(rows, 'rows')
        return rows
    })

    server.get('/user', async (_req, reply) => {
        const connection = server.mysql

        return await pipe(
            TE.tryCatch(
                async () => {
                    return await connection.query('SELECT id, name, last_name FROM demo')
                },
                _e => {
                    return {
                        error: 'there was an error',
                    }
                }
            ),
            TE.map(rows => rows[0]),
            TE.fold(
                (e: { error: string }) => () =>
                    Promise.resolve(
                        reply.status(500).header('Content-Type', 'application/json; charset=utf-8').send(e)
                    ),
                data => () =>
                    Promise.resolve(
                        reply.status(200).header('Content-Type', 'application/json; charset=utf-8').send({
                            data,
                        })
                    )
            )
        )()
    })

    server.post('/user', async (req, reply): Promise<never> => {
        server.log.info(req.body)

        const connection = server.mysql
        return await pipe(
            req.body,
            postUserBodyCodec.decode,
            TE.fromEither,
            TE.chain(b => {
                return TE.tryCatch(
                    async () =>
                        await connection.query('INSERT INTO demo (name,last_name) VALUES (?, ?)', [
                            b.name,
                            b.last_name,
                        ]),
                    identity
                )
            }),
            TE.fold(
                (e: unknown) => {
                    server.log.info(e, 'error')
                    return () =>
                        Promise.resolve(
                            reply
                                .status(500)
                                .header('Content-Type', 'application/json; charset=utf-8')
                                .send({ error: e })
                        )
                },
                b => {
                    server.log.info(b, 'query')
                    return () =>
                        Promise.resolve(
                            reply.status(200).header('Content-Type', 'application/json; charset=utf-8').send({
                                data: b,
                            })
                        )
                }
            )
        )()
    })
}

import * as J from "fp-ts/Json";
import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import * as t from "io-ts";
import * as React from "react";
import "./App.css";

const userResponseCodec = t.type({
  data: t.array(
    t.type({
      id: t.number,
      name: t.string,
      last_name: t.string,
    }),
    "userResponseCodec"
  ),
});

type UserResponse = t.TypeOf<typeof userResponseCodec>;

export const App: React.FC = () => {
  const [users, setUsers] = React.useState<UserResponse["data"]>([]);
  const [post, setPostResource] = React.useState<Response>();

  React.useEffect(() => {
    pipe(
      TE.tryCatch(
        () =>
          fetch(
            `${
              import.meta.env.PROD
                ? import.meta.env.VITE_BE_PROD_URL
                : import.meta.env.VITE_BE_DEV_URL
            }/api/user`
          ),
        () => {
          throw new Error("Error in fetch");
        }
      ),
      TE.chain((r) => {
        const rb = r.body;
        if (rb === null) {
          return TE.left(new Error("Error in fetch"));
        }

        return TE.right(rb.getReader());
      }),
      TE.map((reader) => {
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              });
            }
            push();
          },
        });
      }),
      TE.chain((stream) =>
        TE.tryCatch(
          () =>
            new Response(stream, {
              headers: { "Content-Type": "text/html" },
            }).text(),
          (_e) => new Error("Error in extracting text from user stream")
        )
      ),
      TE.chain((r) => pipe(r, J.parse, TE.fromEither)),
      TE.chainW(flow(userResponseCodec.decode, TE.fromEither)),
      TE.chainFirst((data) => {
        setUsers(data.data);
        return TE.right(data);
      })
    )();
  }, [post]);

  const submitHandler: React.FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const body = {
      name: e.currentTarget.getElementsByTagName("input")[0].value,
      last_name: e.currentTarget.getElementsByTagName("input")[1].value,
    };

    fetch(
      `${
        import.meta.env.PROD
          ? import.meta.env.VITE_BE_PROD_URL
          : import.meta.env.VITE_BE_DEV_URL
      }/api/user`,
      {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((r) => {
      setPostResource(r);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>LISTA NOMI</p>
      </header>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <td>
                <b>NOME</b>
              </td>
              <td>
                <b>COGNOME</b>
              </td>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={`name-${i}`}>
                <td key={`name-${i}`}>{u.name}</td>
                <td key={`last-name-${i}`}>{u.last_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-wrapper">
        <form className="form" onSubmit={submitHandler}>
          <div className="form-row">
            <span>Nome: </span> <input form="data" name="name" />
          </div>
          <div className="form-row">
            <span>Cognome: </span> <input form="data" name="last_name" />
          </div>
          <button type="submit">Crea</button>
        </form>
      </div>
    </div>
  );
};

import * as React from "react";
import "./App.css";

export const App: React.FC = () => {
  const [users, setUsers] = React.useState<
    Array<{ name: string; last_name: string }>
  >([]);

  React.useEffect(() => {
    fetch(
      `${
        import.meta.env.PROD
          ? import.meta.env.VITE_BE_PROD_URL
          : import.meta.env.VITE_BE_DEV_URL
      }/api/user/1`
    )
      .then((response) => response.body)
      .then((rb) => {
        if (rb === null) {
          throw new Error("Error in fetch");
        }
        const reader = rb.getReader();

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
      })
      .then((stream) => {
        return new Response(stream, {
          headers: { "Content-Type": "text/html" },
        }).text();
      })
      .then((result) => {
        setUsers(JSON.parse(result));
      });
  }, []);

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
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Name list</p>
      </header>
      <div>
        <table className="table">
          <thead>
            <tr>
              <td>
                <b>First name:</b>
              </td>
              <td>
                <b>Last name:</b>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              {users.map((u, i) => (
                <React.Fragment key={`name-${i}`}>
                  <td key={`name-${i}`}>{u.name}</td>
                  <td key={`last-name-${i}`}>{u.last_name}</td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <form onSubmit={submitHandler}>
          <span>nome: </span> <input form="data" name="name" />
          <span>cognome: </span> <input form="data" name="last_name" />
          <div>
            <button type="submit">Crea</button>
          </div>
        </form>
      </div>
    </div>
  );
};

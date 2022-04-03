import * as React from "react";

import "./App.css";

export const App: React.FC = () => {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_BE_URL}/user/1`)
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

  console.log(import.meta.env)
  return (
    <div className="App">
      <header className="App-header">
        <p>Name list</p>
      </header>
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
  );
};
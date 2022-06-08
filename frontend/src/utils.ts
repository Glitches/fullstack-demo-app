import * as E from "fp-ts/Either";
import * as J from "fp-ts/Json";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import * as React from "react";

function fetchReducer(state: FetchState, action: FetchState): FetchState {
  switch (action.state) {
    case "init":
      return { state: "init" };
    case "submitted":
      return { state: "submitted" };
    case "rejected":
      return {
        state: "rejected",
        reason: action.reason,
        status: action.status,
      };
    case "fetched":
      return {
        state: "fetched",
        payload: action.payload,
        status: action.status,
      };
  }
}

type FetchState =
  | {
      state: "init";
    }
  | { state: "submitted" }
  | { state: "fetched"; payload: unknown; status: number }
  | { state: "rejected"; reason: unknown; status: number };

export type FetchReducer = (prevState: FetchState) => FetchState;

export function useFetchResource(
  input: RequestInfo,
  init?: RequestInit,
  decoder?: t.Mixed
) {
  const [resource, setResource] = React.useReducer(fetchReducer, {
    state: "init",
  });

  pipe(E.fromNullable({})(init?.body), E.chain(J.stringify));
  const dispatch = () =>
    fetch(
      `${
        import.meta.env.PROD
          ? import.meta.env.VITE_BE_PROD_URL
          : import.meta.env.VITE_BE_DEV_URL
      }/api/user`,
      {
        body: JSON.stringify(init?.body),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(
        (v) => v,
        (reason) =>
          setResource({ state: "rejected", reason: reason, status: reason })
      )
      .then((result) => {
        if (decoder && result instanceof Response) {
          decoder.decode(result.body);

          setResource({
            state: "fetched",
            payload: result.body,
            status: result.status,
          });
        }
      });

  return [resource, dispatch];
}

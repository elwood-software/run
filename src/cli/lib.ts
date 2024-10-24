type ServerErrorData = {
  success: false;
  error: {
    name: string;
    message: string;
    info_url?: string;
  };
};

export class ServerError extends Error {
  constructor(public data: ServerErrorData) {
    super(data.error.message);
  }
}

export function printError(err: unknown) {
  if (err instanceof ServerError) {
    console.log("");
    console.error(
      "%cError executing command:",
      "color: red;font-weight: bold",
    );
    console.log(`${err.data.error.message}`);

    if (err.data.error.info_url) {
      console.log(
        `%cMore information available at: ${err.data.error.info_url}`,
        "color: gray",
      );
    }
    console.log("");

    Deno.exit(1);
  }

  console.error("%cError", "color: red");
  console.log(`%c${(err as Error).message}`, "color: red");
  Deno.exit(1);
}

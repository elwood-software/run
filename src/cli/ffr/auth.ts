import type { FFrCliContext } from "../../types.ts";
import { state } from "../state.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, remoteUrl } = ctx;

  if (args._[1] === "logout") {
    await state.removeToken();
    console.log("You have been logged out.");
    Deno.exit(0);
  }

  try {
    const token = await state.getToken();

    if (token) {
      console.log("You are already authenticated.");
      return;
    }
  } catch (_) {
    // ignore errors
  }

  try {
    await state.provisionToken(remoteUrl);
    console.log(
      'Authenticated successfully. You can now use "ffr" commands.',
    );
  } catch (_) {
    console.error(
      "Unable to authenticate. Please check your credentials and try again.",
    );
  }
}

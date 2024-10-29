import type { FFrCliContext } from "../../types.ts";
import { state } from "../libs/state.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, remoteUrl } = ctx;

  if (args._[1] === "logout") {
    await state.removeToken();
    console.log("You have been logged out.");
    Deno.exit(0);
  }

  if (args._[1] === "refresh") {
    const worked = await state.tryToRefreshToken(remoteUrl);

    if (worked) {
      console.log("Token refreshed successfully.");
      Deno.exit(0);
    } else {
      console.error("Unable to refresh token.");
      console.error("Please check your credentials and try again.");
      Deno.exit(1);
    }
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

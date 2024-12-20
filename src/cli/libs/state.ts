import { Spinner } from "jsr:@std/cli@1.0.6/unstable-spinner";
import { open as openUrl } from "https://deno.land/x/open@v0.0.6/index.ts";

import { join } from "../../deps.ts";
import { base64url, sha256 } from "../../libs/utils.ts";
import type { JsonObject } from "../../types.ts";
import { NotAuthenticatedError, ServerError } from "./error.ts";

type ApiRequestOptions = {
  shouldRetry?: boolean;
};

// inspired by https://github.com/denoland/deployctl/blob/main/src/utils/token_storage/fs.ts
class State {
  configDir: string;
  credentialsFile: string;
  ffrFile: string;
  elwoodDir: string;
  binDir: string;

  constructor() {
    const homeDir = Deno.build.os == "windows"
      ? Deno.env.get("USERPROFILE")!
      : Deno.env.get("HOME")!;
    this.elwoodDir = join(homeDir, ".elwood");

    this.binDir = join(this.elwoodDir, "bin");
    this.configDir = join(this.elwoodDir, "run");

    this.credentialsFile = join(this.elwoodDir, "credentials.json");
    this.ffrFile = join(this.configDir, "ffr.json");
  }

  async getToken(): Promise<JsonObject | null> {
    try {
      const info = await Deno.lstat(this.credentialsFile);
      if (
        !info.isFile || (info.mode !== null && (info.mode & 0o777) !== 0o600)
      ) {
        throw new Error(
          "The credentials file has been tampered with and will be ignored. Please delete it.",
        );
      }
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      } else {
        throw e;
      }
    }
    try {
      const token = JSON.parse(await Deno.readTextFile(this.credentialsFile));
      return token || null;
    } catch (_) {
      throw new Error(
        `The credentials file has been tampered with and will be ignored. Please delete it.`,
      );
    }
  }

  async removeToken() {
    await this.setToken(null);
  }

  async setToken(token: JsonObject | null) {
    await Deno.mkdir(this.configDir, { recursive: true });
    await Deno.writeTextFile(
      this.credentialsFile,
      JSON.stringify(token, null, 2),
      { mode: 0o600 },
    );
    return Promise.resolve();
  }

  async getFfrStorage(): Promise<JsonObject> {
    try {
      return JSON.parse(await Deno.readTextFile(this.credentialsFile)) ?? {};
    } catch {
      return {};
    }
  }

  async saveFFrStorage(value: JsonObject): Promise<JsonObject> {
    const currentValue = await this.getFfrStorage();
    const nextValue = { ...currentValue, ...value };
    await Deno.mkdir(this.configDir, { recursive: true });
    await Deno.writeTextFile(
      this.credentialsFile,
      JSON.stringify(nextValue, null, 2),
      { mode: 0o600 },
    );

    return nextValue;
  }

  async provisionToken(remoteUrl: string) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const claimVerifier = base64url(randomBytes);
    const claimChallenge = base64url(await sha256(claimVerifier));
    const clientId = "1c5d1a99-3534-45ba-a18e-9543b4417641";
    const data = new FormData();
    data.append("client_id", clientId);
    data.append("claim_verifier", claimVerifier);

    const url =
      `${remoteUrl}/auth/cli/login?client_id=${clientId}&claim_challenge=${claimChallenge}`;

    console.log("");
    console.log("%cAuthentication required", "color: green; font-weght: bold");
    console.log('Please log in to authenticate the "ffr" CLI.');
    console.log("");
    console.log(
      "%cWe will try to open the authentication URL in your default browser. ",
      "color: gray",
    );
    console.log(
      "%cIf it fails, please copy the URL and open it manually.",
      "color: gray",
    );

    console.log(`%cAuthorization URL: ${url}`, "color: gray");
    console.log("");

    const spin = new Spinner({
      message: "Waiting for authentication...",
      color: "yellow",
    });
    spin.start();

    try {
      await openUrl(url);

      const tokenStream = await fetch(
        `${remoteUrl}/auth/cli/access-token`,
        {
          method: "POST",
          body: data,
        },
      );
      if (!tokenStream.ok) {
        throw new Error(
          `Error when requesting an access token: ${tokenStream.statusText}`,
        );
      }

      const tokenOrError = await tokenStream.json();

      if (tokenOrError.token) {
        await this.setToken(
          tokenOrError.token,
        );
      }
    } catch (error) {
      spin.stop();
      console.error((error as Error).message);
    } finally {
      spin.stop();
    }
  }

  async tryToRefreshToken(remoteUrl: string): Promise<boolean> {
    const currentToken = await this.getToken();

    try {
      if (!currentToken) {
        return false;
      }

      if (!currentToken.refresh_token) {
        return false;
      }

      const response = await fetch(`${remoteUrl}/auth/cli/refresh`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(currentToken),
      });

      // if the response is ok
      if (response.ok) {
        const { token: nextToken } = await response.json();
        await this.setToken(nextToken);
        return true;
      }
    } catch (err) {
      console.log(err);
      // if there's an error, just ignore
      // we'll let the user handle the token refresh manually
    }

    return false;
  }

  apiProvider(
    remoteUrl: string,
  ): <T = JsonObject>(
    url: string,
    init?: RequestInit,
    options?: ApiRequestOptions,
  ) => Promise<T> {
    return async <T = JsonObject>(
      url: string,
      init: RequestInit = {},
      options: ApiRequestOptions = {},
    ) => {
      let accessToken = (await this.getToken())?.access_token;

      if (!accessToken) {
        await this.provisionToken(remoteUrl);
        const token_ = await this.getToken();

        if (!token_) {
          throw new Error("Unable to get access token");
        }

        accessToken = token_.access_token;
      }

      if (!accessToken) {
        throw new NotAuthenticatedError();
      }

      const response = await fetch(`${remoteUrl}${url}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && options.shouldRetry !== false) {
          const nextToken = await state.tryToRefreshToken(remoteUrl);

          // if we were able to get another token
          // retry the request
          if (nextToken) {
            return await this.apiProvider(remoteUrl)(url, init, {
              shouldRetry: false,
            });
          }

          await state.removeToken();
        }

        const body = await response.json();

        throw new ServerError(
          body ?? {
            success: false,
            error: {
              name: "FailedToFetch",
              message:
                `Failed to fetch: ${response.status} ${response.statusText}`,
            },
          },
        );
      }

      return await response.json() as T;
    };
  }
}

export const state = new State();

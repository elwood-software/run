import { join } from "../deps.ts";
import { base64url, sha256 } from "../libs/utils.ts";
import type { JsonObject } from "../types.ts";

// inspired by https://github.com/denoland/deployctl/blob/main/src/utils/token_storage/fs.ts
class State {
  configDir: string;
  credentialsFile: string;
  ffrFile: string;

  constructor() {
    const homeDir = Deno.build.os == "windows"
      ? Deno.env.get("USERPROFILE")!
      : Deno.env.get("HOME")!;
    this.configDir = join(homeDir, ".elwood", "run");
    this.credentialsFile = join(this.configDir, "credentials.json");
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

  async getFfr(): Promise<JsonObject> {
    try {
      return JSON.parse(await Deno.readTextFile(this.credentialsFile)) ?? {};
    } catch {
      return {};
    }
  }

  async saveFFr(value: JsonObject): Promise<JsonObject> {
    const currentValue = await this.getFfr();
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

    console.log(`Authorization URL: ${url}`);

    const open = new Deno.Command("open", {
      args: [url],
      stderr: "piped",
      stdout: "piped",
    })
      .spawn();

    if (open === undefined) {
      console.log(
        "Cannot open the authorization URL automatically. Please navigate to it manually using your usual browser",
      );
    }

    const tokenStream = await fetch(
      `${remoteUrl}/auth/cli/access-token`,
      {
        method: "POST",
        body: data,
      },
    );
    if (!tokenStream.ok) {
      throw new Error(
        `when requesting an access token: ${await tokenStream.statusText}`,
      );
    }

    const tokenOrError = await tokenStream.json();

    if (tokenOrError.token) {
      await this.setToken(
        tokenOrError.token,
      );
    }
  }

  apiProvider(
    remoteUrl: string,
  ): <T = JsonObject>(url: string, init?: RequestInit) => Promise<T> {
    return async <T = JsonObject>(
      url: string,
      init: RequestInit = {},
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

      const response = await fetch(`${remoteUrl}${url}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await state.removeToken();
        }

        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json() as T;
    };
  }
}

export const state = new State();

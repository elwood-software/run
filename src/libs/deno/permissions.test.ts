import { assertEquals } from "../../deps.ts";

import {
  denoMergePermissions,
  denoPermissionObjectToFlags,
} from "./permissions.ts";

Deno.test("permissionObjectToFlags()", function () {
  assertEquals(
    denoPermissionObjectToFlags({
      env: true,
    }),
    [
      "--allow-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    denoPermissionObjectToFlags({
      env: ["a", "b"],
    }),
    [
      "--allow-env=a,b",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    denoPermissionObjectToFlags({
      env: "inherit",
    }),
    [
      "--deny-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    denoPermissionObjectToFlags({
      env: false,
    }),
    [
      "--deny-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    denoPermissionObjectToFlags({
      env: true,
      ffi: [new URL("https://elwood.dev")],
    }),
    [
      "--allow-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--allow-ffi=https://elwood.dev/",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );
});

Deno.test("denoMergePermissions()", async (t) => {
  const _defaults = {
    env: false,
    sys: false,
    hrtime: false,
    net: false,
    ffi: false,
    read: false,
    run: false,
    write: false,
  };
  const _defaultsTrue = Object.keys(_defaults).reduce((acc, key) => {
    return {
      ...acc,
      [key]: true,
    };
  }, {});

  await t.step("should default to deny anything", () => {
    assertEquals(denoMergePermissions({}, {}), _defaults);
  });

  await t.step("* = true", () => {
    assertEquals(
      denoMergePermissions({ env: "*" }, {}),
      {
        ..._defaults,
        env: true,
      },
    );
    assertEquals(
      denoMergePermissions({ env: "*" }, { env: [] }),
      {
        ..._defaults,
        env: true,
      },
    );
  });

  await t.step("none = false", () => {
    assertEquals(
      denoMergePermissions({ env: "none" }, {}),
      {
        ..._defaults,
        env: false,
      },
    );

    assertEquals(
      denoMergePermissions({ env: "none" }, { env: ["a"] }),
      {
        ..._defaults,
        env: false,
      },
    );
  });

  await t.step("merge string values", () => {
    assertEquals(
      denoMergePermissions({ env: ["A"] }, { env: ["B"] }),
      {
        ..._defaults,
        env: ["A", "B"],
      },
    );
  });

  await t.step("runtime no user pref", () => {
    assertEquals(
      denoMergePermissions({}, { env: ["B"] }),
      {
        ..._defaults,
        env: ["B"],
      },
    );
  });

  await t.step("filter undefined in runtime", () => {
    assertEquals(
      denoMergePermissions({}, { env: [undefined, "B"] }),
      {
        ..._defaults,
        env: ["B"],
      },
    );
  });

  await t.step("* or all or true", () => {
    assertEquals(
      denoMergePermissions("*", {}),
      _defaultsTrue,
    );
    assertEquals(
      denoMergePermissions(true, {}),
      _defaultsTrue,
    );
    assertEquals(
      denoMergePermissions("all", {}),
      _defaultsTrue,
    );
  });

  await t.step("none or true", () => {
    assertEquals(
      denoMergePermissions(false, {}),
      _defaults,
    );
    assertEquals(
      denoMergePermissions("none", {}),
      _defaults,
    );
  });

  await t.step("merge", () => {
    assertEquals(
      denoMergePermissions(["*", undefined], {
        env: ["A"],
      }),
      _defaultsTrue,
    );

    assertEquals(
      denoMergePermissions([{ env: false }, { env: true }], {
        env: ["A"],
      }),
      { ..._defaults, env: true },
    );

    assertEquals(
      denoMergePermissions(["*", undefined], {
        env: ["A"],
      }),
      _defaultsTrue,
    );
  });
});

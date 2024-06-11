import { Workflow } from "../../types.ts";

export function denoPermissionObjectToFlags(
  options: Deno.PermissionOptionsObject,
): string[] {
  const defaults = {
    env: false,
    sys: false,
    hrtime: false,
    net: false,
    ffi: false,
    read: false,
    run: false,
    write: false,
  };

  return Object.entries({ ...defaults, ...options }).reduce(
    (acc, [name, value]) => {
      if (value === false || value === "inherit") {
        return [...acc, `--deny-${name}`];
      }

      if (value === true || (Array.isArray(value) && value.length === 0)) {
        return [...acc, `--allow-${name}`];
      }

      if (Array.isArray(value)) {
        return [...acc, `--allow-${name}=${value.join(",")}`];
      }

      return acc;
    },
    [] as string[],
  );
}

export type RuntimePermissions = Record<
  keyof Workflow.Permissions,
  Array<string | undefined>
>;

export function denoMergePermissions(
  userPermissions: Partial<Workflow.Permissions>,
  runtimePermissions: Partial<RuntimePermissions>,
): Deno.PermissionOptionsObject {
  const defaults: Deno.PermissionOptionsObject = {
    env: "inherit",
    sys: "inherit",
    hrtime: "inherit",
    net: "inherit",
    ffi: "inherit",
    read: "inherit",
    run: "inherit",
    write: "inherit",
  };

  for (const [key, value] of Object.entries(userPermissions)) {
    const key_ = key as keyof Deno.PermissionOptionsObject;

    // false or none means deny
    if (value === false || value === "none") {
      defaults[key_] = false;
      continue;
    }

    // true | * means allow all
    if (value === true || value === "*") {
      defaults[key_] = true;
      continue;
    }

    // array means allow specific
    if (Array.isArray(value)) {
      (defaults[key_] as string[]) = value;
      continue;
    }

    // inherit means inherit from runtime
    // noop
  }

  // go through everything so we have a normalized object
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const key_ = key as keyof RuntimePermissions;
    const value_ = runtimePermissions[key_];

    // false or true we can skip
    if (defaults[key_] === false || defaults[key_] === true) {
      continue;
    }

    // if the default value is still inherit and
    // the runtime hasn't provided a value, assume
    // the permission is denied.
    if (defaultValue === "inherit" && !value_) {
      defaults[key_] = false;
      continue;
    }

    // if runtime hasn't provided a value
    // just go with the default
    if (value_ === undefined) {
      continue;
    }

    // if it's still inherit, we're going to
    // override with a blank array
    if (defaultValue === "inherit") {
      defaults[key_] = [];
    }

    // lets merge in the runtime permissions with the user permissions
    (defaults[key_] as string[]) = [
      ...defaults[key_] as string[],
      ...value_.filter(Boolean) as string[],
    ];
  }

  return defaults;
}

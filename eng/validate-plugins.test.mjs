import assert from "node:assert/strict";
import test from "node:test";
import path from "path";
import { fileURLToPath } from "url";

import { validatePlugin } from "./validate-plugins.mjs";

const FIXTURES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "test",
  "fixtures",
  "validate-plugins"
);

function getFixtureOptions(name) {
  const rootFolder = path.join(FIXTURES_DIR, name);
  return {
    rootFolder,
    pluginsDir: path.join(rootFolder, "plugins"),
  };
}

test("accepts staged source-layout plugin manifests", () => {
  assert.deepEqual(validatePlugin("test-plugin", getFixtureOptions("valid-staged")), []);
});

test("accepts main materialized plugin manifests", () => {
  assert.deepEqual(validatePlugin("test-plugin", getFixtureOptions("valid-main")), []);
});

test("rejects staged manifests with missing repo-root source files", () => {
  const errors = validatePlugin("test-plugin", getFixtureOptions("missing-staged-source"));

  assert.equal(errors.length, 1);
  assert.match(errors[0], /agents\[0\] source not found: agents[\/\\]example\.agent\.md/);
});

test("rejects main manifests with missing materialized plugin files", () => {
  const errors = validatePlugin("test-plugin", getFixtureOptions("missing-main-materialized"));

  assert.equal(errors.length, 1);
  assert.match(errors[0], /skills\[0\] materialized source not found: plugins[\/\\]test-plugin[\/\\]skills[\/\\]example-skill[\/\\]SKILL\.md/);
});

test("rejects plugins that mix staged and main manifest layouts (agents-main, skills-staged)", () => {
  const errors = validatePlugin("test-plugin", getFixtureOptions("mixed-layout"));

  assert.equal(errors.length, 1);
  assert.match(errors[0], /mixes staged source paths and main materialized paths/);
});

test("rejects plugins that mix staged and main manifest layouts (agents-staged, skills-main)", () => {
  const errors = validatePlugin("test-plugin", getFixtureOptions("mixed-layout-reverse"));

  assert.equal(errors.length, 1);
  assert.match(errors[0], /mixes staged source paths and main materialized paths/);
});

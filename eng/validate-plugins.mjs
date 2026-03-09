#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ROOT_FOLDER } from "./constants.mjs";

const DEFAULT_ROOT_FOLDER = ROOT_FOLDER;
const DEFAULT_PLUGINS_DIR = path.join(DEFAULT_ROOT_FOLDER, "plugins");
const PATH_FIELDS = ["agents", "skills"];
const LAYOUT_EXAMPLES = {
  agents: {
    staged: "./agents/my-agent.md",
    main: "./agents",
  },
  skills: {
    staged: "./skills/my-skill/",
    main: "./skills/my-skill",
  },
};

function toDisplayPath(targetPath) {
  return targetPath.split(path.sep).join("/");
}

function resolveValidationOptions(options = {}) {
  const rootFolder = options.rootFolder ?? DEFAULT_ROOT_FOLDER;
  return {
    rootFolder,
    pluginsDir: options.pluginsDir ?? path.join(rootFolder, "plugins"),
  };
}

// Validation functions
function validateName(name, folderName) {
  const errors = [];
  if (!name || typeof name !== "string") {
    errors.push("name is required and must be a string");
    return errors;
  }
  if (name.length < 1 || name.length > 50) {
    errors.push("name must be between 1 and 50 characters");
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    errors.push("name must contain only lowercase letters, numbers, and hyphens");
  }
  if (name !== folderName) {
    errors.push(`name "${name}" must match folder name "${folderName}"`);
  }
  return errors;
}

function validateDescription(description) {
  if (!description || typeof description !== "string") {
    return "description is required and must be a string";
  }
  if (description.length < 1 || description.length > 500) {
    return "description must be between 1 and 500 characters";
  }
  return null;
}

function validateVersion(version) {
  if (!version || typeof version !== "string") {
    return "version is required and must be a string";
  }
  return null;
}

function validateKeywords(keywords) {
  if (keywords === undefined) return null;
  if (!Array.isArray(keywords)) {
    return "keywords must be an array";
  }
  if (keywords.length > 10) {
    return "maximum 10 keywords allowed";
  }
  for (const keyword of keywords) {
    if (typeof keyword !== "string") {
      return "all keywords must be strings";
    }
    if (!/^[a-z0-9-]+$/.test(keyword)) {
      return `keyword "${keyword}" must contain only lowercase letters, numbers, and hyphens`;
    }
    if (keyword.length < 1 || keyword.length > 30) {
      return `keyword "${keyword}" must be between 1 and 30 characters`;
    }
  }
  return null;
}

function classifySpecPath(field, relPath) {
  if (!relPath.startsWith("./")) {
    return null;
  }

  if (field === "agents") {
    if (relPath.startsWith("./agents/") && relPath.endsWith(".md")) {
      return relPath.length > "./agents/.md".length ? "staged" : null;
    }
    if (relPath === "./agents") {
      return "main";
    }
    if (
      relPath.startsWith("./agents/") &&
      !relPath.endsWith("/") &&
      !relPath.endsWith(".md")
    ) {
      return relPath.length > "./agents/".length ? "main" : null;
    }
    return null;
  }

  if (field === "skills") {
    if (relPath.startsWith("./skills/") && relPath.endsWith("/")) {
      return relPath.length > "./skills//".length ? "staged" : null;
    }
    if (relPath.startsWith("./skills/") && !relPath.endsWith("/")) {
      return relPath.length > "./skills/".length ? "main" : null;
    }
    return null;
  }

  return null;
}

function getPathFormatError(field, index) {
  const examples = LAYOUT_EXAMPLES[field];
  return `${field}[${index}] must use staged "${examples.staged}" or main "${examples.main}" path syntax`;
}

function findMarkdownFile(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile() && entry.name.endsWith(".md")) {
      return true;
    }
    if (entry.isDirectory() && findMarkdownFile(fullPath)) {
      return true;
    }
  }

  return false;
}

function validateStagedEntry(field, index, relPath, rootFolder, errors) {
  if (field === "agents") {
    const basename = relPath.slice("./agents/".length, -".md".length);
    const agentFileName = basename.endsWith(".agent")
      ? `${basename}.md`
      : `${basename}.agent.md`;
    const srcFile = path.join(rootFolder, "agents", agentFileName);
    if (!fs.existsSync(srcFile)) {
      errors.push(
        `${field}[${index}] source not found: ${toDisplayPath(path.join("agents", agentFileName))}`
      );
    }
    return;
  }

  const skillName = relPath.slice("./skills/".length, -1);
  const skillFile = path.join(rootFolder, "skills", skillName, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    errors.push(
      `${field}[${index}] source not found: ${toDisplayPath(path.join("skills", skillName, "SKILL.md"))}`
    );
  }
}

function validateMainEntry(field, index, relPath, pluginDir, rootFolder, errors) {
  if (field === "agents") {
    const materializedDir = path.join(pluginDir, relPath.slice(2));
    if (!findMarkdownFile(materializedDir)) {
      errors.push(
        `${field}[${index}] materialized files not found: ${toDisplayPath(path.relative(rootFolder, materializedDir))}`
      );
    }
    return;
  }

  const skillFile = path.join(pluginDir, relPath.slice(2), "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    errors.push(
      `${field}[${index}] materialized source not found: ${toDisplayPath(path.relative(rootFolder, skillFile))}`
    );
  }
}

function validateSpecPaths(plugin, options = {}) {
  const { rootFolder, pluginDir } = options;
  const errors = [];
  const entries = [];
  const layouts = new Set();

  for (const field of PATH_FIELDS) {
    const arr = plugin[field];
    if (arr === undefined) continue;
    if (!Array.isArray(arr)) {
      errors.push(`${field} must be an array`);
      continue;
    }

    for (let i = 0; i < arr.length; i++) {
      const relPath = arr[i];
      if (typeof relPath !== "string") {
        errors.push(`${field}[${i}] must be a string`);
        continue;
      }
      if (!relPath.startsWith("./")) {
        errors.push(`${field}[${i}] must start with "./"`);
        continue;
      }

      const layout = classifySpecPath(field, relPath);
      if (!layout) {
        errors.push(getPathFormatError(field, i));
        continue;
      }

      layouts.add(layout);
      entries.push({ field, index: i, relPath, layout });
    }
  }

  if (layouts.size > 1) {
    errors.push(
      'plugin mixes staged source paths and main materialized paths; use staged paths like "./agents/my-agent.md" and "./skills/my-skill/", or main paths like "./agents" and "./skills/my-skill"'
    );
    return errors;
  }

  for (const entry of entries) {
    if (entry.layout === "staged") {
      validateStagedEntry(entry.field, entry.index, entry.relPath, rootFolder, errors);
    } else {
      validateMainEntry(entry.field, entry.index, entry.relPath, pluginDir, rootFolder, errors);
    }
  }

  return errors;
}

export function validatePlugin(folderName, options = {}) {
  const { rootFolder, pluginsDir } = resolveValidationOptions(options);
  const pluginDir = path.join(pluginsDir, folderName);
  const errors = [];

  // Rule 1: Must have .github/plugin/plugin.json
  const pluginJsonPath = path.join(pluginDir, ".github/plugin", "plugin.json");
  if (!fs.existsSync(pluginJsonPath)) {
    errors.push("missing required file: .github/plugin/plugin.json");
    return errors;
  }

  // Rule 2: Must have README.md
  const readmePath = path.join(pluginDir, "README.md");
  if (!fs.existsSync(readmePath)) {
    errors.push("missing required file: README.md");
  }

  // Parse plugin.json
  let plugin;
  try {
    const raw = fs.readFileSync(pluginJsonPath, "utf-8");
    plugin = JSON.parse(raw);
  } catch (err) {
    errors.push(`failed to parse plugin.json: ${err.message}`);
    return errors;
  }

  // Rule 3 & 4: name, description, version
  const nameErrors = validateName(plugin.name, folderName);
  errors.push(...nameErrors);

  const descError = validateDescription(plugin.description);
  if (descError) errors.push(descError);

  const versionError = validateVersion(plugin.version);
  if (versionError) errors.push(versionError);

  // Rule 5: keywords (or tags for backward compat)
  const keywordsError = validateKeywords(plugin.keywords ?? plugin.tags);
  if (keywordsError) errors.push(keywordsError);

  // Rule 6: agents, skills path layouts
  const specErrors = validateSpecPaths(plugin, { rootFolder, pluginDir });
  errors.push(...specErrors);

  return errors;
}

export function validatePlugins(options = {}) {
  const { pluginsDir } = resolveValidationOptions(options);

  if (!fs.existsSync(pluginsDir)) {
    console.log("No plugins directory found - validation skipped");
    return true;
  }

  const pluginDirs = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (pluginDirs.length === 0) {
    console.log("No plugin directories found - validation skipped");
    return true;
  }

  console.log(`Validating ${pluginDirs.length} plugins...\n`);

  let hasErrors = false;
  const seenNames = new Set();

  for (const dir of pluginDirs) {
    console.log(`Validating ${dir}...`);

    const errors = validatePlugin(dir, options);

    if (errors.length > 0) {
      console.error(`❌ ${dir}:`);
      errors.forEach((e) => console.error(`   - ${e}`));
      hasErrors = true;
    } else {
      console.log(`✅ ${dir} is valid`);
    }

    // Rule 10: duplicate names
    if (seenNames.has(dir)) {
      console.error(`❌ Duplicate plugin name "${dir}"`);
      hasErrors = true;
    } else {
      seenNames.add(dir);
    }
  }

  if (!hasErrors) {
    console.log(`\n✅ All ${pluginDirs.length} plugins are valid`);
  }

  return !hasErrors;
}

function main() {
  try {
    const isValid = validatePlugins();
    if (!isValid) {
      console.error("\n❌ Plugin validation failed");
      process.exit(1);
    }
    console.log("\n🎉 Plugin validation passed");
  } catch (error) {
    console.error(`Error during validation: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

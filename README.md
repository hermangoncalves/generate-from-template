# generate-from-template

A lightweight file and folder templating engine in TypeScript.

## Description

This library allows you to generate projects or code by copying files and folders from a template directory, replacing variables in both file names and file contents.

It supports both text and binary files and lets you specify replacement variables with flexible delimiters.

## Installation

Using npm:

```bash
npm install generate-from-template
````

Using pnpm:

```bash
pnpm add generate-from-template
```

Or install locally from your path:

```bash
pnpm install /path/to/generate-from-template
```

## Usage

```typescript
import { generateFromTemplate } from "generate-from-template";

generateFromTemplate(
  "./template-dir",
  "./output-dir",
  { projectName: "MyProject", author: "YourName" },
  (file) => console.log(`Created: ${file}`),
  (err) => {
    if (err) {
      console.error("Error generating template:", err);
    } else {
      console.log("Template generation completed successfully!");
    }
  }
);
```
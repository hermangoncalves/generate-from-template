import path from "path";
import walker from "walker";
import fs from "fs";
import os from "os";
import { isBinaryFile } from "isbinaryfile";
import split from "split2";
import pump from "pump";

/**
 * A key-value map used for template variable replacements.
 */
export type TemplateData = {
  [key: string]: any;
};

/**
 * Callback executed after each file is processed.
 */
export type OnFileCallback = (file: string) => void;

/**
 * Callback executed once processing is complete or an error occurs.
 */
export type DoneCallback = (err?: Error | null) => void;

/**
 * Generates files from a template directory, replacing variables in file names and contents.
 *
 * @param source Path to the template directory
 * @param dest Path to the destination directory
 * @param data Key-value object for variable replacements
 * @param onFile Optional callback executed after each file is generated
 * @param onComplete Optional callback executed when all files are processed or if an error occurs
 */
export function generateFromTemplate(
  source: string,
  dest: string,
  data: TemplateData = {},
  onFile?: OnFileCallback,
  onComplete?: DoneCallback
): void {
  let count = 1;
  source = path.resolve(source);

  const done = (err?: Error | null) => {
    if (err) return onComplete?.(err);
    if (--count === 0) onComplete?.();
  };

  walker(source)
    .on("file", (file: string) => {
      count++;
      const relativePath = path.relative(source, file).replace(/^__/, ".");
      const newPath = replaceVars(relativePath, data, "@", "@");
      const target = path.join(dest, newPath);

      fs.mkdir(path.dirname(target), { recursive: true }, (err) => {
        if (err) return done(err);

        isBinaryFile(file).then((isBinaryFile) => {
          const read = fs.createReadStream(file);
          const write = fs.createWriteStream(target);

          const transform = isBinaryFile
            ? read
            : read.pipe(
                split(
                  (line: string) => replaceVars(line, data, "__", "__") + os.EOL
                )
              );

          pump(transform, write, () => {
            onFile?.(newPath);
            done();
          });
        });
      });
    })
    .on("end", done)
    .on("error", done);
}

/**
 * Replaces variables in a string using a given prefix and suffix.
 * Example: 'Hello __name__' with { name: 'World' } becomes 'Hello World'.
 */
function replaceVars(
  str: string,
  vars: TemplateData,
  prefix: string,
  suffix: string
): string {
  return str.replace(
    new RegExp(`${escape(prefix)}(.*?)${escape(suffix)}`, "g"),
    (_, key) => {
      return vars[key] ?? "";
    }
  );
}

/**
 * Escapes special RegExp characters in a string.
 */
function escape(str: string): string {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

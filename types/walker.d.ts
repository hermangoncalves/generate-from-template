declare module "walker" {
  import { EventEmitter } from "events";

  function walker(root: string): EventEmitter;
  export = walker;
}

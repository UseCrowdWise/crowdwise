import log from "loglevel";
import logprefix from "loglevel-plugin-prefix";

/**
 * Project-wide logging
 * */
function setup() {
  log.setLevel("trace");
  logprefix.reg(log);
  logprefix.apply(log);
}

setup();

export { log };

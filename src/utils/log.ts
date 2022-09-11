import log from "loglevel";
import logprefix from "loglevel-plugin-prefix";

/**
 * Project-wide logging
 * */
function setup() {
  if (process.env.NODE_ENV === "production") {
    log.setLevel("silent");
  } else {
    log.setLevel("trace");
    logprefix.reg(log);
    logprefix.apply(log);
  }
}

setup();

export { log };

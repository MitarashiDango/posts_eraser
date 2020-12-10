import log4js from "log4js";

log4js.configure({
  appenders: {
    system: {
      type: "file",
      filename: "./logs/delete.log",
    },
  },
  categories: {
    default: {
      appenders: ["system"],
      level: "debug",
    },
  },
});

export const Logger = log4js.getLogger("system");

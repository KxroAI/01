/**
 * Copyright (c) 2025 openUwU
 * Code by bre4d777
 * MIT License
 */

export const emoji = {
  unlock: "<:unlock:1451623734690447471>",
  trash: "<:trash:1451623739069300876>",
  ticket: "<:ticket:1451623743318134932>",
  starFill: "<:starFill:1451623747642589284>",
  starEmpty: "<:starEmpty:1451623752122241176>",
  settings: "<:settings:1451623755490267158>",
  remove: "<:remove:1451623759457812543>",
  logs: "<:logs:1451623763732070470>",
  lock: "<:lock:1451623768316317758>",
  dashboard: "<:dashboard:1451623775144640728>",
  cross: "<:close:1451623779062124735>",
  check: "<:check:1451623783197704262>",
  add: "<:add:1451623786683039866>",

  get(name, fallback = "") {
    return this[name] || fallback;
  },
};

export default emoji;

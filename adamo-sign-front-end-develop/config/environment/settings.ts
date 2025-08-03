import settingsDEV from "./development.json";
import settingsINT from "./integration.json";
import settingsLOCAL from "./local.json";
import settingsPROD from "./production.json";
import settingsEnv from "./settings-env.json";

const settingsMap = {
  local: settingsLOCAL,
  dev: settingsDEV,
  int: settingsINT,
  prod: settingsPROD,
};

const env = settingsEnv.cloudEnv.toLowerCase() as keyof typeof settingsMap;
const selectedSettings = settingsMap[env] || settingsDEV;

const {
  app: { name, mocks, local },
  api: { base, auth, notificationsWs },
  cloudEnv,
} = selectedSettings;

export const settingsApp = {
  app: {
    name,
    mocks,
    local,
  },
  api: {
    base,
    auth,
    notificationsWs,
  },
  environment: cloudEnv || "development",
};

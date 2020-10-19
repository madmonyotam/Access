import { isObject } from 'lodash';
import { addFunctionsToAccess } from "./accessBuilder";

let config = {};

const mergeDeep = (target, source) => {
  const innerTarget = JSON.parse(JSON.stringify(target));

  if (!source) return innerTarget;

  if (isObject(innerTarget) && isObject(source)) {
    for (const key in source) {
      if (Array.isArray(source[key])) {
        Object.assign(innerTarget, { [key]: source[key] });
      } else if (isObject(source[key])) {
        if (!innerTarget[key]) Object.assign(innerTarget, { [key]: {} });
        innerTarget[key] = mergeDeep(innerTarget[key], source[key]);
      } else {
        Object.assign(innerTarget, { [key]: source[key] });
      }
    }
  }

  return innerTarget;
};

export const addToConfig = (pluginConfig) => {
  config = mergeDeep(config, pluginConfig);
  addFunctionsToAccess();
};

export const getFromConfig = (path) => {
  if (!path) return config;
  
  return config[path];
};

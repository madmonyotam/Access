
import { isUndefined, isObject, isString } from 'lodash';
import { getFromConfig } from './gate';
import memoize from 'memoizee';

const accessFunctions = {};

const memo = (func) => {
  return memoize(func, { primitive: true });
};

const get = (collection, path, delimiter = '.') => {
  if (!path) return collection;
  
  let value = collection;

  if (typeof path === 'string') {
    path = path.split(delimiter);
  }

  for (let i = 0; i < path.length; i++) {
    if (typeof value === 'undefined') {
      return undefined;
    }
    value = value[path[i]];
  }

  return value;
};

const getNested = (type, path, delimiter = '.') => {
  const collection = getFromConfig(type);
  const code = get(collection, path, delimiter);

  if (isUndefined(code)) return undefined;
  if (isObject(code)) return code;
  if (isString(code)) {
    if (code.indexOf(delimiter) > -1) return getNested(type, code);
  }

  return code;
};

export const addFunctionsToAccess = () => {

  const configKeys = Object.keys(getFromConfig());
  
  configKeys.forEach(configSubject => {
    if(!accessFunctions[configSubject]){
      accessFunctions[configSubject] = memo((path, delimiter) => getNested(configSubject, path, delimiter));
    }
  });

  return accessFunctions;
}

export const clearAllCache = () => {
  const configKeys = Object.keys(accessFunctions);

  configKeys.forEach((configSubject) => {
    accessFunctions[configSubject].clear();
  })
}

addFunctionsToAccess();

export default accessFunctions;

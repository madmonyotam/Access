
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

const getNestedEndValue = (newObject = {}, obj, type, delimiter) => {
  const keys = Object.keys(obj);

  keys.forEach((key) => {
    const value = obj[key];

    if (isUndefined(value)) newObject[key] = undefined;
    else if (Array.isArray(value)) newObject[key] = value;
    else if (isObject(value)) {
      newObject[key] = getNestedEndValue({}, value, type, delimiter);
    } else if (isString(value)) {
      if (value.indexOf(delimiter) > -1) {
        newObject[key] =  getNested(type, value);
      } else {
        newObject[key] = value;
      }
    }
  });

  return newObject;
};

const getNested = (type, path, delimiter = '.') => {
  const collection = getFromConfig(type);
  const code = get(collection, path, delimiter);

  if (isUndefined(code)) return undefined;
  if (Array.isArray(code)) return code;
  if (isObject(code)) return getNestedEndValue({}, code, type, delimiter);
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

// config.js
import * as Servers from './utils/servers';
import * as Variables from './utils/variables';

const Config = {
  ...Servers,
  ...Variables,
};

export * from './utils/servers';
export * from './utils/variables';
export default Config;

import stringUtils, { StringUtils } from './string';

export interface UtilsModule {
  string: StringUtils;
}

const utilsModule: UtilsModule = {
  string: stringUtils,
};

export default () => utilsModule;

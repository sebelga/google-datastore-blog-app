import gstoreUtils, { GstoreUtils } from './gstore';
import stringUtils, { StringUtils } from './string';

export interface UtilsModule {
  gstore: GstoreUtils;
  string: StringUtils;
}

const utilsModule: UtilsModule = {
  gstore: gstoreUtils,
  string: stringUtils,
};

export default () => utilsModule;

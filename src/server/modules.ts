import initUtilsModule from './modules/utils';

export default () => {
  /**
   * Initialize our module by passing the context & each module dependencies
   */
  const utils = initUtilsModule();

  return {
    utils,
  };
};

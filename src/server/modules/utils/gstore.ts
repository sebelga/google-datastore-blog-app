import { Logger } from 'winston';
import GstoreNode from 'gstore-node';

type FunctionReturnPromise = (...args: any[]) => Promise<any>;

interface Hooks {
  [key: string]: { [key: string]: Array<FunctionReturnPromise> };
  pre: {
    save: Array<FunctionReturnPromise>;
    delete: Array<FunctionReturnPromise>;
  };
  post: {
    delete: Array<FunctionReturnPromise>;
  };
}

export interface GstoreUtils {
  initDynamicHooks(
    schema: GstoreNode.Schema,
    logger: Logger
  ): {
    addPreSaveHook(handler: FunctionReturnPromise | FunctionReturnPromise[]): void;
    addPreDeleteHook(handler: FunctionReturnPromise | FunctionReturnPromise[]): void;
    addPostDeleteHook(handler: FunctionReturnPromise | FunctionReturnPromise[]): void;
  };
}

const gstoreUtils: GstoreUtils = {
  initDynamicHooks(schema, logger) {
    const hooks: Hooks = {
      pre: {
        save: [],
        delete: [],
      },
      post: {
        delete: [],
      },
    };

    const runHooks = (hook: string, method: 'save' | 'delete') => {
      return function runHooks(...args: any[]) {
        const hooksToRun = hooks[hook][method];
        return hooksToRun.reduce(
          (prev, curr) =>
            prev.then(curr.bind(this, ...args)).catch(err => {
              logger.error(`BlogPost gstore hook error: ${err.message}`, err);
            }),
          Promise.resolve()
        );
      };
    };

    schema.pre('save', runHooks('pre', 'save'));
    schema.pre('delete', runHooks('pre', 'delete'));
    schema.post('delete', runHooks('post', 'delete'));

    return {
      addPreSaveHook(handler) {
        if (Array.isArray(handler)) {
          handler.forEach(h => hooks.pre.save.push(h));
        } else {
          hooks.pre.save.push(handler);
        }
      },
      addPreDeleteHook(handler) {
        if (Array.isArray(handler)) {
          handler.forEach(h => hooks.pre.delete.push(h));
        } else {
          hooks.pre.delete.push(handler);
        }
      },
      addPostDeleteHook(handler) {
        if (Array.isArray(handler)) {
          handler.forEach(h => hooks.post.delete.push(h));
        } else {
          hooks.post.delete.push(handler);
        }
      },
    };
  },
};

export default gstoreUtils;

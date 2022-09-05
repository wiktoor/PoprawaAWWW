exports.fun = () => 'test';

// eslint-disable-next-line no-promise-executor-return
exports.asyncfun = () => new Promise((resolve) => setTimeout(() => resolve('atest'), 1000));
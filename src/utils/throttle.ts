export type ThrottledFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

export function throttle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  wait = 800,
): ThrottledFunction<TArgs> {
  let lastRun = 0;
  let timer: number | undefined;
  let lastArgs: TArgs | undefined;

  const run = () => {
    lastRun = Date.now();
    timer = undefined;

    if (lastArgs) {
      callback(...lastArgs);
      lastArgs = undefined;
    }
  };

  const throttled = ((...args: TArgs) => {
    const now = Date.now();
    const remaining = wait - (now - lastRun);
    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
      run();
      return;
    }

    if (timer === undefined) {
      timer = window.setTimeout(run, remaining);
    }
  }) as ThrottledFunction<TArgs>;

  throttled.cancel = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = undefined;
  };

  return throttled;
}

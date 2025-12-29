export interface TimerRef {
  id: any;
  clear: () => void;
}

/**
 * 创建一个定时器引用，便于统一管理定时器
 */
export function createTimer(timeoutCallback: () => void, delay: number): TimerRef {
  const id = setTimeout(timeoutCallback, delay);
  return {
    id,
    clear: () => {
      if (id) {
        clearTimeout(id);
      }
    }
  };
}
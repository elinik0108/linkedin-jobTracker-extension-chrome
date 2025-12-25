function waitForElement(selector, timeout = 10000) {

  return new Promise((resolve, reject) => {
    const start = Date.now();

    //sometimes linkedin does not load things in order so we wait
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout  " + selector));
      }
    }, 300);
  });
}

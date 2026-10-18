/* Shared teardown for the browser test scripts. The headless browser and the local server are closed on
   success, on failure, on Ctrl+C / SIGTERM / SIGHUP / SIGBREAK and when the script's own deadline passes.
   The deadline matters most on Windows: an outer timeout or crash kills node with TerminateProcess, which
   runs no finally blocks or signal handlers and leaves headless Chrome running, so the script stops itself first. */
module.exports = function harness(name, { deadlineMs = 240000 } = {}) {
  deadlineMs = Number(process.env.TEST_DEADLINE_MS) || deadlineMs; // e.g. to rehearse a hung run
  const resources = [];
  let closing = null;
  const close = () => closing || (closing = (async () => {
    for (const release of resources.splice(0).reverse()) { try { await release(); } catch (e) {} }
  })());
  const bail = (code, why) => {
    if (why) console.error(`${name}: ${why}`);
    close().finally(() => process.exit(code));
  };
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.once(sig, () => bail(130, `interrupted (${sig}), closing the browser`));
  process.once('uncaughtException', e => { console.error(e); bail(1); });
  process.once('unhandledRejection', e => { console.error(e); bail(1); });
  const timer = setTimeout(() => bail(1, `still running after ${deadlineMs / 1000}s, closing the browser`), deadlineMs);
  timer.unref();
  return {
    browser(b) { resources.push(() => b.close()); return b; },
    server(s) {
      resources.push(() => new Promise(resolve => { if (s.closeAllConnections) s.closeAllConnections(); s.close(() => resolve()); }));
      return s;
    },
    // Call once at the end (from .finally): releases everything and stops the deadline.
    async finish() { clearTimeout(timer); await close(); }
  };
};

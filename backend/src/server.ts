import app from './app';

const PORT = parseInt(process.env.PORT ?? '5000', 10);

const server = app.listen(PORT, () => {
  console.log(`\n🚀  PulseDX API running`);
  console.log(`   ▸ Local:   http://localhost:${PORT}`);
  console.log(`   ▸ Docs:    http://localhost:${PORT}/api/docs`);
  console.log(`   ▸ Health:  http://localhost:${PORT}/api/health`);
  console.log(`   ▸ Env:     ${process.env.NODE_ENV ?? 'development'}\n`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force-kill if still hanging after 10 s
  setTimeout(() => {
    console.error('Forced exit after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;

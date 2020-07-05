import app from './app';
import logger from './common/logger';

/**
 * Start Express server.
 */
app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  logger.info(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
  console.log('  Press CTRL-C to stop\n');
});

export default server;

import app from '@/app.js';
import { server } from '@const/constants.js';
import chalk from 'chalk';

const serverUrl = `http://${server.host}:${server.port}`;
const docsUrl = `${serverUrl}/docs/`;

app.listen(server.port, server.host, () => {
  console.log('                _    _               ');
  console.log(' ___  ___   ___| | _| | ___  ___ ___ ');
  console.log('/ __|/ _ \\ / __| |/ / |/ _ \\/ __/ __|');
  console.log('\\__ \\ (_) | (__|   <| |  __/\\__ \\__ \\');
  console.log('|___/\\___/ \\___|_|\\_\\_|\\___||___/___/ v0.1\n');

  console.log(`Server listening on ${chalk.yellow(serverUrl)}.\n`);

  console.log(`View the (quite epic) documentation at ${chalk.cyan(docsUrl)}.`);
});
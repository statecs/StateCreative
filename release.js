require('dotenv').config({ path: '.env' });
const path = require('path');
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();
const localBuildDir = path.join(__dirname, 'build');
const remoteDir = process.env.REMOTE_DIR;

async function deploy() {
  if (!remoteDir) {
    console.error('REMOTE_DIR is not set in .env');
    process.exit(1);
  }
  try {
    await ssh.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT || '22',
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });

    console.log(`Uploading build/ → ${remoteDir}...`);
    await ssh.putDirectory(localBuildDir, remoteDir, {
      recursive: true,
      validate: (itemPath) => !path.basename(itemPath).startsWith('.'),
      tick: (localPath, remotePath, error) => {
        if (error) console.error(`Failed: ${localPath}`, error);
      },
    });
    console.log('Deploy complete.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    ssh.dispose();
  }
}

deploy();

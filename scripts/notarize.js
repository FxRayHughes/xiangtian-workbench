const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.thisky.browser',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'appstore@thisky.com',
    appleIdPassword: 'dyke-eukd-rgyj-orin',
  });
}

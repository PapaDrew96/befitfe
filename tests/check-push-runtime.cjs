const { _android: android } = require('playwright');

(async () => {
  let device = null;

  try {
    const devices = await android.devices();

    if (!devices.length) {
      throw new Error(
        'No Android emulator/device found.'
      );
    }

    device = devices[0];

    const webview = await device.webView(
      {
        pkg: 'gr.befittraining.app'
      },
      {
        timeout: 30000
      }
    );

    const page = await webview.page();

    const result =
      await page.evaluate(
        () => {
          return {
            capacitorExists:
              !!window.Capacitor,

            isNative:
              !!(
                window.Capacitor &&
                typeof window.Capacitor.isNativePlatform === 'function' &&
                window.Capacitor.isNativePlatform()
              ),

            pluginNames:
              Object.keys(
                (
                  window.Capacitor &&
                  window.Capacitor.Plugins
                ) ||
                {}
              ),

            pushNotificationsExists:
              !!(
                window.Capacitor &&
                window.Capacitor.Plugins &&
                window.Capacitor.Plugins.PushNotifications
              )
          };
        }
      );

    console.log(result);

  } catch (error) {
    console.error(error);
    process.exitCode = 1;

  } finally {
    if (device) {
      await device.close();
    }
  }
})();

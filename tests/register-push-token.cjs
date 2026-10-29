const { _android: android } = require('playwright');

const PACKAGE_NAME = 'gr.befittraining.app';

async function main() {
  let device = null;

  try {
    console.log('');
    console.log('BE-FIT Push Registration Test');
    console.log('=============================');
    console.log('');

    const devices = await android.devices();

    if (!devices.length) {
      throw new Error('No Android emulator/device found.');
    }

    device = devices[0];

    const webview = await device.webView(
      {
        pkg: PACKAGE_NAME
      },
      {
        timeout: 30000
      }
    );

    const page = await webview.page();

    const result = await page.evaluate(async () => {
      const PushNotifications =
        window.Capacitor &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.PushNotifications;

      if (!PushNotifications) {
        throw new Error(
          'PushNotifications plugin not available.'
        );
      }

      let permission =
        await PushNotifications.checkPermissions();

      if (
        permission.receive === 'prompt' ||
        permission.receive === 'prompt-with-rationale'
      ) {
        permission =
          await PushNotifications.requestPermissions();
      }

      if (permission.receive !== 'granted') {
        return {
          ok: false,
          permission: permission.receive,
          error: 'Notification permission not granted.'
        };
      }

      return await new Promise(async (resolve) => {
        let finished = false;

        const timeout =
          window.setTimeout(
            function () {
              if (finished) {
                return;
              }

              finished = true;

              resolve({
                ok: false,
                permission: permission.receive,
                error: 'Timed out waiting for FCM registration token.'
              });
            },
            60000
          );

        const registrationHandle =
          await PushNotifications.addListener(
            'registration',
            function (token) {
              if (finished) {
                return;
              }

              finished = true;
              window.clearTimeout(timeout);

              resolve({
                ok: true,
                permission: permission.receive,
                token: token.value
              });

              registrationHandle.remove();
              registrationErrorHandle.remove();
            }
          );

        const registrationErrorHandle =
          await PushNotifications.addListener(
            'registrationError',
            function (error) {
              if (finished) {
                return;
              }

              finished = true;
              window.clearTimeout(timeout);

              resolve({
                ok: false,
                permission: permission.receive,
                error:
                  error &&
                  (
                    error.error ||
                    error.message
                  )
                    ? (
                        error.error ||
                        error.message
                      )
                    : String(error)
              });

              registrationHandle.remove();
              registrationErrorHandle.remove();
            }
          );

        await PushNotifications.register();
      });
    });

    console.log('');
    console.log(result);
    console.log('');

    if (!result.ok) {
      throw new Error(
        result.error ||
        'Push registration failed.'
      );
    }

    console.log('✅ PUSH REGISTRATION PASSED');
    console.log('');
    console.log('Permission:', result.permission);
    console.log('');
    console.log('FCM token:');
    console.log(result.token);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ PUSH REGISTRATION FAILED');
    console.error('');
    console.error(error);
    console.error('');

    process.exitCode = 1;

  } finally {
    if (device) {
      await device.close();
    }
  }
}

main();

const { _android: android } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = 'gr.befittraining.app';

const APK_PATH = path.resolve(
  __dirname,
  '../android/app/build/outputs/apk/debug/app-debug.apk'
);

const SCREENSHOT_PATH = path.resolve(
  __dirname,
  '../test-results/android-smoke.png'
);

async function main() {
  let device = null;

  try {
    console.log('');
    console.log('BE-FIT Android Smoke Test');
    console.log('=========================');
    console.log('');

    console.log('[1/8] Looking for Android device...');

    const devices = await android.devices();

    assert.ok(
      devices.length > 0,
      'No Android device/emulator found. Start the emulator first.'
    );

    device = devices[0];

    console.log(
      '      Connected:',
      device.model(),
      '(' + device.serial() + ')'
    );

    console.log('[2/8] Checking APK...');

    assert.ok(
      fs.existsSync(APK_PATH),
      'Debug APK not found: ' + APK_PATH
    );

    console.log('[3/8] Installing current APK...');

    await device.installApk(APK_PATH);

    console.log('[4/8] Clearing previous app data...');

    await device.shell(
      'pm clear ' + PACKAGE_NAME
    );

    console.log('[5/8] Launching BE-FIT...');

    await device.shell(
      'monkey -p ' +
      PACKAGE_NAME +
      ' -c android.intent.category.LAUNCHER 1'
    );

    console.log('[6/8] Waiting for Capacitor WebView...');

    const webview = await device.webView(
      {
        pkg: PACKAGE_NAME
      },
      {
        timeout: 30000
      }
    );

    const page = await webview.page();

    await page.waitForLoadState(
      'domcontentloaded'
    );

    await page.waitForFunction(
      () => {
        return !!(
          window.BEFIT_CONFIG &&
          window.jQuery &&
          window.bootstrap
        );
      },
      null,
      {
        timeout: 20000
      }
    );

    console.log('[7/8] Checking native configuration...');

    const runtime = await page.evaluate(
      () => {
        const config =
          window.BEFIT_CONFIG || {};

        const installVisible =
          Array.from(
            document.querySelectorAll(
              'a, button'
            )
          ).some(function (element) {
            const text =
              (
                element.textContent || ''
              ).trim();

            const style =
              window.getComputedStyle(
                element
              );

            return (
              text.includes(
                'Install BE-FIT'
              ) &&
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              element.offsetParent !== null
            );
          });

        return {
          href:
            window.location.href,

          origin:
            window.location.origin,

          title:
            document.title,

          isNative:
            config.IS_NATIVE,

          platform:
            config.PLATFORM,

          apiBaseUrl:
            config.API_BASE_URL,

          jquery:
            !!window.jQuery,

          bootstrap:
            !!window.bootstrap,

          installVisible:
            installVisible
        };
      }
    );

    console.log('');
    console.log(runtime);
    console.log('');

    assert.equal(
      runtime.origin,
      'https://localhost'
    );

    assert.equal(
      runtime.isNative,
      true
    );

    assert.equal(
      runtime.platform,
      'android'
    );

    assert.equal(
      runtime.apiBaseUrl,
      'https://api.befittraining.gr/api/v1'
    );

    assert.equal(
      runtime.jquery,
      true
    );

    assert.equal(
      runtime.bootstrap,
      true
    );

    assert.equal(
      runtime.installVisible,
      false
    );

    const passwordInput =
      page.locator(
        'input[type="password"]'
      ).first();

    await passwordInput.waitFor({
      state: 'visible',
      timeout: 15000
    });

    console.log('[8/8] Checking production API...');

    const health =
      await page.evaluate(
        async () => {
          const response =
            await fetch(
              window.BEFIT_CONFIG
                .API_BASE_URL +
              '/health'
            );

          return {
            status:
              response.status,

            ok:
              response.ok,

            body:
              await response.text()
          };
        }
      );

    assert.equal(
      health.status,
      200
    );

    assert.equal(
      health.ok,
      true
    );

    await page.screenshot({
      path: SCREENSHOT_PATH,
      fullPage: true
    });

    console.log('');
    console.log(
      '✅ BE-FIT ANDROID SMOKE TEST PASSED'
    );

    console.log(
      'Screenshot:',
      SCREENSHOT_PATH
    );

    console.log('');
  } catch (error) {
    console.error('');
    console.error(
      '❌ BE-FIT ANDROID SMOKE TEST FAILED'
    );

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

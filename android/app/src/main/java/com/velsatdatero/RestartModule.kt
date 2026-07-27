package com.trackvel.mobile

import android.content.Intent
import android.os.Process
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class RestartModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  @ReactMethod
  fun restart() {
    UiThreadUtil.runOnUiThread {
      val ctx = reactContext.applicationContext
      val launchIntent = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName)
      if (launchIntent != null) {
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        ctx.startActivity(launchIntent)
      }
      Process.killProcess(Process.myPid())
    }
  }

  companion object {
    const val NAME = "AppRestart"
  }
}

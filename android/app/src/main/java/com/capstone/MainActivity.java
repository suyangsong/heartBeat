package com.capstone;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.support.v4.app.ActivityCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;


public class MainActivity extends ReactActivity {
    WahooService mService;
    boolean mBound = false;
    ServiceConnection connection = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        WahooService.LocalBinder binder = (WahooService.LocalBinder) service;
        mService = binder.getService();
        ReactContext reactContext = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
        mService.setContext(reactContext);
        mBound = true;
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        mBound = false;
    }
    // Checking permissions on init


    };

    String[] perms = {
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION"
    };
    public static final int PERMISSION_REQ_CODE = 1234;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override public void invokeDefaultOnBackPressed() { moveTaskToBack(true); }

    @Override
    protected String getMainComponentName() {
        return "Capstone";
    }

    @SuppressLint("NewApi")
    public void checkPerms() {
        // Checking if device version > 22 and we need to use new permission model

        for (String perm : perms) {
            // Checking each persmission and if denied then requesting permissions
            if (checkSelfPermission(perm) == PackageManager.PERMISSION_DENIED) {
                requestPermissions(perms, PERMISSION_REQ_CODE);
                break;
            }
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        checkPerms();


    }
    @Override 
    protected void onStart(){
        super.onStart();
        Intent intent = new Intent(this, WahooService.class);
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {

                if(mBound == false)
                {
                bindService(intent,connection, Context.BIND_AUTO_CREATE);
                mBound = true;
                }
            }
        }, 1000);

    }
    @Override
    protected void onStop(){
        super.onStop();
        if(mBound)
        {
            unbindService(connection);
        }

    }

    
}

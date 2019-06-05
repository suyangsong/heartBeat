package com.capstone;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.wahoofitness.connector.HardwareConnector;
import com.wahoofitness.connector.HardwareConnectorEnums;
import com.wahoofitness.connector.HardwareConnectorTypes;
import com.wahoofitness.connector.capabilities.Capability;
import com.wahoofitness.connector.capabilities.Heartrate;
import com.wahoofitness.connector.conn.connections.SensorConnection;
import com.wahoofitness.connector.conn.connections.params.ConnectionParams;
import com.wahoofitness.connector.listeners.discovery.DiscoveryListener;

public class WahooService extends Service {
    ReactContext mReactContext;
    public void setContext(ReactContext lecontext){
        mReactContext = lecontext;
    }

    private final HardwareConnector.Listener mHardwareConnectorListener = new HardwareConnector.Listener() {
        @Override
        public void onHardwareConnectorStateChanged(@NonNull HardwareConnectorTypes.NetworkType networkType, @NonNull HardwareConnectorEnums.HardwareConnectorState hardwareConnectorState) {

        }

        @Override
        public void onFirmwareUpdateRequired(@NonNull SensorConnection sensorConnection, @NonNull String s, @NonNull String s1) {

        }
    };
    private HardwareConnector mHardwareConnector;
    public DiscoveryListener mDiscoveryListener;

    private void sendEvent (ReactContext Rcontext, String eventName, @Nullable WritableMap params)
    {
        Rcontext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,params);
    }



    @Override
    public Context getApplicationContext() {
        return super.getApplicationContext();
    }

    public Heartrate.Listener mHeartRateListener = new Heartrate.Listener() {
        @Override
        public void onHeartrateData(@NonNull Heartrate.Data data) {

           double hr = data.getHeartrate().asEventsPerMinute();
            WritableMap params = Arguments.createMap();
            params.putDouble("heartrate",hr);
            if(mReactContext != null)
            sendEvent(mReactContext, "onHeartrate", params);
        }

        @Override
        public void onHeartrateDataReset() {

        }
    };

    private SensorConnection mSensorConnection;
    private final SensorConnection.Listener mSensorConnectionListener = new SensorConnection.Listener () {
        @Override
        public void onNewCapabilityDetected ( SensorConnection sensorConnection , Capability.CapabilityType capabilityType ) {
            if ( capabilityType == Capability.CapabilityType.Heartrate ) {
                Heartrate heartrate = ( Heartrate ) sensorConnection . getCurrentCapability ( Capability.CapabilityType.Heartrate );
                heartrate.addListener ( mHeartRateListener );
            }
        }
        @Override
        public void onSensorConnectionStateChanged(@NonNull SensorConnection var1, @NonNull HardwareConnectorEnums.SensorConnectionState var2)
        {

        }
        public void onSensorConnectionError(@NonNull SensorConnection var1, @NonNull HardwareConnectorEnums.SensorConnectionError var2)
        {

        }
    };

    private final IBinder binder = new LocalBinder();
    public class LocalBinder extends Binder {
        WahooService getService() {
            // Return this instance of LocalService so clients can call public methods
            return WahooService.this;
        }
    }
    @Override
    public IBinder onBind(Intent intent) {
        mDiscoveryListener = new DiscoveryListener() {
            @Override
            public void onDeviceDiscovered(@NonNull ConnectionParams connectionParams) {
                mHardwareConnector.requestSensorConnection(connectionParams, mSensorConnectionListener);
            }

            @Override
            public void onDiscoveredDeviceLost(@NonNull ConnectionParams connectionParams) {

            }

            @Override
            public void onDiscoveredDeviceRssiChanged(@NonNull ConnectionParams connectionParams, int i) {

            }
        };
        mHardwareConnector.startDiscovery(mDiscoveryListener);
        return binder;
    }

    @Override
    public void onCreate(){
        initWahooHardwareConnector();



        }
    @Override
    public void onDestroy() {
        super.onDestroy ();
        mHardwareConnector.shutdown ();
    }

    private void initWahooHardwareConnector()
    {

        mHardwareConnector = new HardwareConnector ( this , mHardwareConnectorListener );

    }


}


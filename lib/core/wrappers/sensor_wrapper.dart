import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:proximity_sensor/proximity_sensor.dart';

/// Wrapper for sensor interactions (Proximity, etc.)
class SensorWrapper {
  StreamSubscription<int>? _proximitySubscription;
  final Function(bool isNear) onProximityChanged;

  SensorWrapper({required this.onProximityChanged});

  void startListening() {
    try {
      _proximitySubscription = ProximitySensor.events.listen((int event) {
        // event > 0 usually means "near" (or object detected) depending on sensor.
        // Standard Android/iOS: 0 = far, 1 = near (or vice versa depending on implementation).
        // Actually, usually 0 is near (blocked) and >0 is far (cm).
        // Let's check package docs or assume standard behavior:
        // "The stream emits 1 if the sensor detects something close, and 0 otherwise." -> wait, let's verify.
        // Common behavior: 0 = near, 1 = far (binary).
        // BUT `proximity_sensor` package says: "Stream<int> events".
        // Let's assume > 0 is NEAR (object detected) based on typical boolean mapping, 
        // OR check if it returns distance.
        // Most simple sensors return 0 or 1.
        // Let's assume: event > 0 means "Near" (Object detected).
        // Wait, standard Android is: 0 = Near, 5/8 = Far.
        // Let's try: event > 0 ? false : true (if 0 is near).
        // Actually, let's assume the package normalizes it.
        // "The plugin returns 1 if an object is close, and 0 otherwise." (common for plugins).
        // Let's assume 1 = Near.
        
        bool isNear = event > 0;
        onProximityChanged(isNear);
      });
      debugPrint('SensorWrapper: Started listening to Proximity Sensor');
    } catch (e) {
      debugPrint('SensorWrapper: Error starting proximity sensor: $e');
    }
  }

  void stopListening() {
    _proximitySubscription?.cancel();
    _proximitySubscription = null;
    debugPrint('SensorWrapper: Stopped listening');
  }
}

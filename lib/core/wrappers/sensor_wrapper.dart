import 'package:sensors_plus/sensors_plus.dart';
import 'package:proximity_sensor/proximity_sensor.dart';
import 'dart:async';

/// SensorWrapper - Device Sensors Manager
/// Handles Accelerometer, Gyroscope, Magnetometer, and Proximity
class SensorWrapper {
  static final SensorWrapper _instance = SensorWrapper._internal();
  factory SensorWrapper() => _instance;
  SensorWrapper._internal();

  // Streams
  Stream<AccelerometerEvent>? _accelerometerStream;
  Stream<UserAccelerometerEvent>? _userAccelerometerStream;
  Stream<GyroscopeEvent>? _gyroscopeStream;
  Stream<MagnetometerEvent>? _magnetometerStream;
  Stream<int>? _proximityStream;

  /// Get accelerometer stream (includes gravity)
  Stream<AccelerometerEvent> get accelerometer {
    _accelerometerStream ??= accelerometerEventStream();
    return _accelerometerStream!;
  }

  /// Get user accelerometer stream (excludes gravity)
  Stream<UserAccelerometerEvent> get userAccelerometer {
    _userAccelerometerStream ??= userAccelerometerEventStream();
    return _userAccelerometerStream!;
  }

  /// Get gyroscope stream
  Stream<GyroscopeEvent> get gyroscope {
    _gyroscopeStream ??= gyroscopeEventStream();
    return _gyroscopeStream!;
  }

  /// Get magnetometer stream
  Stream<MagnetometerEvent> get magnetometer {
    _magnetometerStream ??= magnetometerEventStream();
    return _magnetometerStream!;
  }

  /// Get proximity stream
  /// Returns 1 if near, 0 if far (usually)
  Stream<int> get proximity {
    _proximityStream ??= ProximitySensor.events;
    return _proximityStream!;
  }

  /// Check if device has shake motion
  /// Returns a stream that emits when shake is detected
  Stream<void> get shakeStream {
    return userAccelerometer.map((event) {
      // Simple shake detection logic
      double acceleration = event.x * event.x + event.y * event.y + event.z * event.z;
      return acceleration > 100; // Threshold
    }).where((isShaking) => isShaking).map((_) {});
  }

  /// Listen to proximity (helper)
  StreamSubscription<int> listenProximity(Function(bool isNear) onData) {
    return proximity.listen((event) {
      // > 0 usually means object detected (Near)
      onData(event > 0);
    });
  }

  /// Start listening to sensors (placeholder for explicit start if needed)
  void startListening() {
    // Sensors plus streams are broadcast and start automatically on listen
    // This method is kept for API compatibility if explicit start is added later
  }

  /// Stop listening to sensors (placeholder)
  void stopListening() {
    // Stream subscriptions should be cancelled by the consumer
  }
}

/// Global instance
final sensorWrapper = SensorWrapper();

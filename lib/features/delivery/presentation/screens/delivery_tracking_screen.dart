import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:rizik_v4/core/wrappers/location_wrapper.dart';

/// Delivery Tracking Screen
/// Live map tracking of delivery
class DeliveryTrackingScreen extends StatefulWidget {
  final String orderId;
  final double pickupLat;
  final double pickupLng;
  final double dropoffLat;
  final double dropoffLng;

  const DeliveryTrackingScreen({
    super.key,
    required this.orderId,
    required this.pickupLat,
    required this.pickupLng,
    required this.dropoffLat,
    required this.dropoffLng,
  });

  @override
  State<DeliveryTrackingScreen> createState() => _DeliveryTrackingScreenState();
}

class _DeliveryTrackingScreenState extends State<DeliveryTrackingScreen> {
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  @override
  void initState() {
    super.initState();
    _setupMap();
  }

  void _setupMap() {
    // Pickup Marker
    _markers.add(Marker(
      markerId: const MarkerId('pickup'),
      position: LatLng(widget.pickupLat, widget.pickupLng),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      infoWindow: const InfoWindow(title: 'Pickup'),
    ));

    // Dropoff Marker
    _markers.add(Marker(
      markerId: const MarkerId('dropoff'),
      position: LatLng(widget.dropoffLat, widget.dropoffLng),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      infoWindow: const InfoWindow(title: 'Dropoff'),
    ));

    // Mover Marker (Live)
    // In real app, we'd subscribe to RealtimeDB/Supabase for mover location updates
    // For now, static or simulated
    _markers.add(Marker(
      markerId: const MarkerId('mover'),
      position: LatLng(widget.pickupLat, widget.pickupLng), // Start at pickup
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      infoWindow: const InfoWindow(title: 'Mover'),
    ));

    // Polyline
    _polylines.add(Polyline(
      polylineId: const PolylineId('route'),
      points: [
        LatLng(widget.pickupLat, widget.pickupLng),
        LatLng(widget.dropoffLat, widget.dropoffLng),
      ],
      color: Colors.blue,
      width: 5,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Track Delivery')),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(widget.pickupLat, widget.pickupLng),
          zoom: 14,
        ),
        markers: _markers,
        polylines: _polylines,
        onMapCreated: (controller) => _mapController = controller,
      ),
    );
  }
}

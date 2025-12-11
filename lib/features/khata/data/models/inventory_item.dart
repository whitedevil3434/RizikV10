class InventoryItem {
  final String id;
  final String squadId;
  final String consumableId;
  final double quantity;
  final String unit;
  final String status;
  final DateTime? expiryDate;

  InventoryItem({
    required this.id,
    required this.squadId,
    required this.consumableId,
    required this.quantity,
    required this.unit,
    required this.status,
    this.expiryDate,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id'],
      squadId: json['squad_id'],
      consumableId: json['consumable_id'],
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'],
      status: json['status'],
      expiryDate: json['expiry_date'] != null ? DateTime.parse(json['expiry_date']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'consumable_id': consumableId,
      'quantity': quantity,
      'unit': unit,
      'status': status,
      'expiry_date': expiryDate?.toIso8601String(),
    };
  }
}

class ScreenModel {
  final String id;
  final String type;
  final Map<String, dynamic> data;

  ScreenModel({
    required this.id,
    required this.type,
    required this.data,
  });

  factory ScreenModel.fromJson(Map<String, dynamic> json) {
    return ScreenModel(
      id: json['id'] ?? '',
      type: json['type'] ?? 'unknown',
      data: json,
    );
  }
}

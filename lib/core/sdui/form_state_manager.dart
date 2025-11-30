class FormStateManager {
  static final FormStateManager _instance = FormStateManager._internal();
  factory FormStateManager() => _instance;
  FormStateManager._internal();

  final Map<String, String> _formData = {};

  void setValue(String key, String value) {
    _formData[key] = value;
  }

  String? getValue(String key) {
    return _formData[key];
  }

  Map<String, String> getAllValues() {
    return Map.from(_formData);
  }

  void clear() {
    _formData.clear();
  }
}

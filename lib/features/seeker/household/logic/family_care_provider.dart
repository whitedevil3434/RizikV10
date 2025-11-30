import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

enum TaskType {
  childPickup,
  doctorAppointment,
  schoolEvent,
  other,
}

class FamilyCareTask {
  final String id;
  final TaskType type;
  final String childName;
  final DateTime scheduledTime;
  final String? location;
  final String assignedTo;
  final bool isCompleted;
  final bool swapRequested;

  const FamilyCareTask({
    required this.id,
    required this.type,
    required this.childName,
    required this.scheduledTime,
    this.location,
    required this.assignedTo,
    this.isCompleted = false,
    this.swapRequested = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.name,
        'childName': childName,
        'scheduledTime': scheduledTime.toIso8601String(),
        'location': location,
        'assignedTo': assignedTo,
        'isCompleted': isCompleted,
        'swapRequested': swapRequested,
      };

  factory FamilyCareTask.fromJson(Map<String, dynamic> json) {
    return FamilyCareTask(
      id: json['id'],
      type: TaskType.values.firstWhere((e) => e.name == json['type']),
      childName: json['childName'],
      scheduledTime: DateTime.parse(json['scheduledTime']),
      location: json['location'],
      assignedTo: json['assignedTo'],
      isCompleted: json['isCompleted'] ?? false,
      swapRequested: json['swapRequested'] ?? false,
    );
  }

  FamilyCareTask copyWith({
    bool? isCompleted,
    bool? swapRequested,
    String? assignedTo,
  }) {
    return FamilyCareTask(
      id: id,
      type: type,
      childName: childName,
      scheduledTime: scheduledTime,
      location: location,
      assignedTo: assignedTo ?? this.assignedTo,
      isCompleted: isCompleted ?? this.isCompleted,
      swapRequested: swapRequested ?? this.swapRequested,
    );
  }
}

class FamilyCareProvider with ChangeNotifier {
  List<FamilyCareTask> _tasks = [];
  bool _isLoading = false;
  String? _error;

  List<FamilyCareTask> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String? get error => _error;

  FamilyCareProvider() {
    _loadTasks();
  }

  /// Get tasks assigned to a specific user
  List<FamilyCareTask> getTasksForUser(String userId) {
    return _tasks.where((task) => task.assignedTo == userId && !task.isCompleted).toList();
  }

  /// Get upcoming tasks
  List<FamilyCareTask> get upcomingTasks {
    final now = DateTime.now();
    return _tasks.where((task) => 
      task.scheduledTime.isAfter(now) && !task.isCompleted
    ).toList()..sort((a, b) => a.scheduledTime.compareTo(b.scheduledTime));
  }

  /// Load tasks from storage
  Future<void> _loadTasks() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final tasksJson = prefs.getString('family_care_tasks');

      if (tasksJson != null) {
        final List<dynamic> tasksList = jsonDecode(tasksJson);
        _tasks = tasksList
            .map((json) => FamilyCareTask.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load tasks: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save tasks to storage
  Future<void> _saveTasks() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final tasksJson = jsonEncode(_tasks.map((task) => task.toJson()).toList());
      await prefs.setString('family_care_tasks', tasksJson);
    } catch (e) {
      debugPrint('Error saving tasks: $e');
    }
  }

  /// Add a new task
  Future<void> addTask(FamilyCareTask task) async {
    _tasks.add(task);
    await _saveTasks();
    notifyListeners();
  }

  /// Request a task swap
  Future<void> requestSwap(String taskId) async {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      _tasks[index] = _tasks[index].copyWith(swapRequested: true);
      await _saveTasks();
      notifyListeners();
    }
  }

  /// Complete a task
  Future<void> completeTask(String taskId) async {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      _tasks[index] = _tasks[index].copyWith(isCompleted: true);
      await _saveTasks();
      notifyListeners();
    }
  }
}

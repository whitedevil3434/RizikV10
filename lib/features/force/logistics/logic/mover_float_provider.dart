import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/mover_float.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/remote/mover_float_service.dart';

/// Provider for managing mover float
class MoverFloatProvider with ChangeNotifier {
  MoverFloat? _currentFloat;
  bool _isLoading = false;
  String? _error;

  MoverFloat? get currentFloat => _currentFloat;
  bool get isLoading => _isLoading;
  String? get error => _error;

  MoverFloatProvider() {
    _loadFloat();
  }

  /// Load float from storage
  Future<void> _loadFloat() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final floatJson = prefs.getString('mover_float');

      if (floatJson != null) {
        final floatData = jsonDecode(floatJson) as Map<String, dynamic>;
        _currentFloat = MoverFloat.fromJson(floatData);
        
        // Check if reset is needed
        await _checkAndResetFloat();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load float: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save float to storage
  Future<void> _saveFloat() async {
    if (_currentFloat == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final floatJson = jsonEncode(_currentFloat!.toJson());
      await prefs.setString('mover_float', floatJson);
    } catch (e) {
      debugPrint('Error saving float: $e');
    }
  }

  /// Initialize float for a mover
  Future<void> initializeFloat({
    required String moverId,
    required double trustScore,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      _currentFloat = MoverFloat.create(
        moverId: moverId,
        trustScore: trustScore,
      );

      await _saveFloat();
      _error = null;
    } catch (e) {
      _error = 'Failed to initialize float: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Check if mover can request float
  FloatRequestResult canRequestFloat(TrustScore trustScore) {
    if (_currentFloat == null) {
      return FloatRequestResult(
        canRequest: false,
        reason: 'Float not initialized',
        reasonBn: 'ফ্লোট শুরু হয়নি',
      );
    }

    return MoverFloatService.canRequestFloat(
      currentFloat: _currentFloat!,
      trustScore: trustScore,
    );
  }

  /// Request float (morning deposit)
  Future<void> requestFloat() async {
    if (_currentFloat == null) {
      throw Exception('Float not initialized');
    }

    try {
      _isLoading = true;
      notifyListeners();

      _currentFloat = MoverFloatService.processFloatRequest(
        currentFloat: _currentFloat!,
      );

      await _saveFloat();
      _error = null;
    } catch (e) {
      _error = 'Failed to request float: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Process mission completion with auto-deduction
  Future<FloatDeductionResult> processMissionCompletion({
    required double missionEarnings,
    required String missionId,
  }) async {
    if (_currentFloat == null) {
      return FloatDeductionResult(
        success: false,
        deductedAmount: 0,
        remainingEarnings: missionEarnings,
        updatedFloat: _currentFloat!,
        error: 'Float not initialized',
      );
    }

    try {
      final result = MoverFloatService.processMissionCompletion(
        currentFloat: _currentFloat!,
        missionEarnings: missionEarnings,
        missionId: missionId,
      );

      if (result.success) {
        _currentFloat = result.updatedFloat;
        await _saveFloat();
        notifyListeners();
      }

      return result;
    } catch (e) {
      debugPrint('Error processing mission completion: $e');
      return FloatDeductionResult(
        success: false,
        deductedAmount: 0,
        remainingEarnings: missionEarnings,
        updatedFloat: _currentFloat!,
        error: e.toString(),
      );
    }
  }

  /// Calculate repayment preview for mission
  RepaymentPreview? calculateRepaymentPreview(double missionEarnings) {
    if (_currentFloat == null) return null;

    return MoverFloatService.calculateRepaymentPreview(
      currentFloat: _currentFloat!,
      missionEarnings: missionEarnings,
    );
  }

  /// Check and reset float if needed (called at midnight or on app start)
  Future<void> _checkAndResetFloat() async {
    if (_currentFloat == null) return;

    final resetFloat = MoverFloatService.resetFloatIfNeeded(_currentFloat!);
    
    if (resetFloat != null) {
      _currentFloat = resetFloat;
      await _saveFloat();
      notifyListeners();
    }
  }

  /// Manually trigger float reset check
  Future<void> checkFloatReset() async {
    await _checkAndResetFloat();
  }

  /// Check for overdue float
  Future<void> checkOverdueFloat() async {
    if (_currentFloat == null) return;

    final checkedFloat = MoverFloatService.checkOverdueFloat(_currentFloat!);
    
    if (checkedFloat.status != _currentFloat!.status) {
      _currentFloat = checkedFloat;
      await _saveFloat();
      notifyListeners();
    }
  }

  /// Get float statistics
  FloatStatistics? getStatistics() {
    if (_currentFloat == null) return null;

    return MoverFloatService.getStatistics(_currentFloat!);
  }

  /// Get transaction history
  List<FloatTransaction> get transactionHistory {
    return _currentFloat?.transactions.reversed.toList() ?? [];
  }

  /// Get today's transactions
  List<FloatTransaction> get todayTransactions {
    if (_currentFloat == null) return [];

    final today = DateTime.now();
    return _currentFloat!.transactions.where((t) {
      return t.timestamp.day == today.day &&
          t.timestamp.month == today.month &&
          t.timestamp.year == today.year;
    }).toList();
  }

  /// Update trust score and recalculate daily limit
  Future<void> updateTrustScore(double newTrustScore) async {
    if (_currentFloat == null) return;

    try {
      final newDailyLimit = MoverFloatService.calculateDailyLimit(newTrustScore);
      
      _currentFloat = _currentFloat!.copyWith(
        trustScore: newTrustScore,
        dailyLimit: newDailyLimit,
      );

      await _saveFloat();
      notifyListeners();
    } catch (e) {
      debugPrint('Error updating trust score: $e');
    }
  }

  /// Reset float (for testing)
  @visibleForTesting
  Future<void> resetFloat() async {
    _currentFloat = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('mover_float');
    notifyListeners();
  }
}

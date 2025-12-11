import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final mojoProvider = ChangeNotifierProvider<MojoProvider>((ref) {
  return MojoProvider();
});


enum MojoState {
  idle,
  listening,
  speaking,
  processing,
  poor,    // Low wallet balance
  referee, // Tribunal active
  warning, // Nazar Shield / Alert
}

class MojoProvider with ChangeNotifier {
  MojoState _state = MojoState.idle;

  MojoState get state => _state;

  void setIdle() {
    _state = MojoState.idle;
    notifyListeners();
  }

  void setListening() {
    _state = MojoState.listening;
    notifyListeners();
  }

  void setSpeaking() {
    _state = MojoState.speaking;
    notifyListeners();
  }

  void setProcessing() {
    _state = MojoState.processing;
    notifyListeners();
  }

  void setPoor() {
    _state = MojoState.poor;
    notifyListeners();
  }

  void setReferee() {
    _state = MojoState.referee;
    notifyListeners();
  }

  void setWarning() {
    _state = MojoState.warning;
    notifyListeners();
  }

  void setMojoState(MojoState newState) {
    _state = newState;
    notifyListeners();
  }

  bool _isAiActive = false;
  bool get isAiActive => _isAiActive;

  void setAiActive(bool active) {
    if (_isAiActive != active) {
      _isAiActive = active;
      notifyListeners();
    }
  }

  String _recognizedText = '';
  String get recognizedText => _recognizedText;

  String _aiResponseText = '';
  String get aiResponseText => _aiResponseText;

  void setRecognizedText(String text) {
    _recognizedText = text;
    notifyListeners();
  }

  void setAiResponseText(String text) {
    _aiResponseText = text;
    notifyListeners();
  }

  void clearText() {
    _recognizedText = '';
    _aiResponseText = '';
    notifyListeners();
  }

  /// Update Mojo state based on wallet balance
  void updateFromWalletBalance(double balance) {
    const lowBalanceThreshold = 100.0; // Threshold in BDT
    
    if (balance < lowBalanceThreshold && _state != MojoState.referee) {
      setPoor();
    } else if (_state == MojoState.poor && balance >= lowBalanceThreshold) {
      setIdle();
    }
  }

  /// Update Mojo state when tribunal is active
  void updateFromTribunalStatus(bool isTribunalActive) {
    if (isTribunalActive) {
      setReferee();
    } else if (_state == MojoState.referee) {
      setIdle();
    }
  }
}

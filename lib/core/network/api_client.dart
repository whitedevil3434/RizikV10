import 'package:dio/dio.dart';
import '../wrappers/security/secure_enclave_wrapper.dart';

class ApiClient {
  final Dio dio;
  final SecureEnclaveWrapper secureEnclave;

  ApiClient(this.dio, this.secureEnclave);
}

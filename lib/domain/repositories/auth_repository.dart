import '../../data/remote/auth_remote_source.dart';
import '../../data/local/hive_storage.dart';

abstract class AuthRepository {
  Future<void> loginUser(String email, String password);
}

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteSource remoteSource;
  final HiveStorage localSource;

  AuthRepositoryImpl({required this.remoteSource, required this.localSource});

  @override
  Future<void> loginUser(String email, String password) async {
    // TODO: Implement login
    print("Login with $email");
  }
}

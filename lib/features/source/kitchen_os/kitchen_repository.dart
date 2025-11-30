import '../../../core/network/api_client.dart';

abstract class KitchenRepository {
  // TODO: Add methods
}

class KitchenRepositoryImpl implements KitchenRepository {
  final ApiClient apiClient;

  KitchenRepositoryImpl(this.apiClient);
}

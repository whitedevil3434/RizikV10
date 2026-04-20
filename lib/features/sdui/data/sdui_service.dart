import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/config/supabase_config.dart';
import '../domain/sdui_models.dart';

part 'sdui_service.g.dart';

class SDUIService {
  final _client = SupabaseConfig.client;

  Future<SDUIScreen> fetchScreen(String screenId) async {
    try {
      final response = await _client
          .from('rizik_sdui_configs')
          .select()
          .eq('screen_id', screenId)
          .single();

      return SDUIScreen.fromJson(response);
    } catch (e) {
      print('⚠️ SDUI Fetch Error for $screenId: $e. Using local fallback.');
      return _getFallbackScreen(screenId);
    }
  }

  SDUIScreen _getFallbackScreen(String id) {
    if (id == 'home_sd') {
      return SDUIScreen(
        id: 'home_sd',
        title: 'Rizik Hub (Offline)',
        root: const SDUIComponent(
          type: 'column',
          props: {'padding': 16, 'crossAlign': 'start'},
          children: [
            SDUIComponent(
              type: 'text',
              props: {'text': 'Welcome to Rizik V10', 'size': 24, 'weight': 600}
            ),
            SDUIComponent(
              type: 'gap',
              props: {'h': 16}
            ),
            SDUIComponent(
              type: 'card',
              props: {'padding': 24},
              children: [
                SDUIComponent(
                  type: 'text',
                  props: {'text': 'Supabase table rizik_sdui_configs not detected. Running in mock mode.', 'size': 14, 'color': '#D32F2F'}
                )
              ]
            ),
          ],
        ),
      );
    }
    return SDUIScreen(
      id: 'error',
      title: 'Error',
      root: const SDUIComponent(type: 'text', props: {'text': 'Screen not found'}),
    );
  }
}

@riverpod
SDUIService sduiService(SduiServiceRef ref) {
  return SDUIService();
}

@riverpod
Future<SDUIScreen> sduiScreen(SduiScreenRef ref, String screenId) {
  return ref.watch(sduiServiceProvider).fetchScreen(screenId);
}

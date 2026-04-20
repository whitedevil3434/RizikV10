// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sdui_service.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$sduiServiceHash() => r'9749bbfead74cae4661f0d05cb55bf8569bc8f57';

/// See also [sduiService].
@ProviderFor(sduiService)
final sduiServiceProvider = AutoDisposeProvider<SDUIService>.internal(
  sduiService,
  name: r'sduiServiceProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$sduiServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef SduiServiceRef = AutoDisposeProviderRef<SDUIService>;
String _$sduiScreenHash() => r'7f1d3e0c17d9b99f8bec1169e91682672432ba14';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

/// See also [sduiScreen].
@ProviderFor(sduiScreen)
const sduiScreenProvider = SduiScreenFamily();

/// See also [sduiScreen].
class SduiScreenFamily extends Family<AsyncValue<SDUIScreen>> {
  /// See also [sduiScreen].
  const SduiScreenFamily();

  /// See also [sduiScreen].
  SduiScreenProvider call(
    String screenId,
  ) {
    return SduiScreenProvider(
      screenId,
    );
  }

  @override
  SduiScreenProvider getProviderOverride(
    covariant SduiScreenProvider provider,
  ) {
    return call(
      provider.screenId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'sduiScreenProvider';
}

/// See also [sduiScreen].
class SduiScreenProvider extends AutoDisposeFutureProvider<SDUIScreen> {
  /// See also [sduiScreen].
  SduiScreenProvider(
    String screenId,
  ) : this._internal(
          (ref) => sduiScreen(
            ref as SduiScreenRef,
            screenId,
          ),
          from: sduiScreenProvider,
          name: r'sduiScreenProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$sduiScreenHash,
          dependencies: SduiScreenFamily._dependencies,
          allTransitiveDependencies:
              SduiScreenFamily._allTransitiveDependencies,
          screenId: screenId,
        );

  SduiScreenProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.screenId,
  }) : super.internal();

  final String screenId;

  @override
  Override overrideWith(
    FutureOr<SDUIScreen> Function(SduiScreenRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: SduiScreenProvider._internal(
        (ref) => create(ref as SduiScreenRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        screenId: screenId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<SDUIScreen> createElement() {
    return _SduiScreenProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is SduiScreenProvider && other.screenId == screenId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, screenId.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin SduiScreenRef on AutoDisposeFutureProviderRef<SDUIScreen> {
  /// The parameter `screenId` of this provider.
  String get screenId;
}

class _SduiScreenProviderElement
    extends AutoDisposeFutureProviderElement<SDUIScreen> with SduiScreenRef {
  _SduiScreenProviderElement(super.provider);

  @override
  String get screenId => (origin as SduiScreenProvider).screenId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member

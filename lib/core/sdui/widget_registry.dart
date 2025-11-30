
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/core/sdui/form_state_manager.dart';
import 'package:rizik_v4/data/remote/api_service.dart';
import 'package:rizik_v4/core/sdui/renderer.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_trust_aura.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_expense_summary.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_aura_card.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_mission_offer.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_dhaar_status.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_float_monitor.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_tribunal_case.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_duty_card.dart';
import 'package:rizik_v4/core/sdui/widgets/widget_duty_card.dart';
import 'package:rizik_v4/core/sdui/widgets/rizik_visuals.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_moneybag_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_cart_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_unified_wallet_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_trust_score_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_order_stats_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_mission_stats_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_squad_stats_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_inventory_stats_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_shopping_stats_display.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_profile_display.dart';
// Model-based widgets
import 'package:rizik_v4/core/sdui/widgets/model/widget_order_status_card.dart';
import 'package:rizik_v4/core/sdui/widgets/model/widget_mission_card.dart';
import 'package:rizik_v4/core/sdui/widgets/model/widget_squad_card.dart';
// Business widgets
import 'package:rizik_v4/features/fintech/wallet/presentation/moneybag_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/order_tracker.dart';
import 'package:rizik_v4/core/sdui/widgets/business/service_grid.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/rizik_mojo.dart';
import 'package:rizik_v4/core/sdui/widgets/bridge/widget_order_tracker_display.dart';
import 'package:rizik_v4/core/sdui/widgets/dynamic_form.dart';
import 'package:rizik_v4/core/sdui/widgets/list_renderer.dart';
import 'package:rizik_v4/core/sdui/widgets/business/meal_toggle_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/squad_tribunal_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/mover_float_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/bazar_item_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/family_care_alert.dart';
import 'package:rizik_v4/core/sdui/widgets/business/savings_advisor_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/asset_rental_card.dart';
// Missing Features Widgets
import 'package:rizik_v4/core/sdui/widgets/business/bazar_feed_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/video_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/negotiation_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/storefront_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/hyperlocal_service_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/group_expense_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/duty_roster_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/inventory_card.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/fintech/loans/logic/rizik_dhaar_provider.dart';
import 'package:rizik_v4/core/sdui/widgets/business/tohobil_health_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/float_status_card.dart';
import 'package:rizik_v4/core/sdui/widgets/business/mission_chain_alert.dart';
import 'package:rizik_v4/core/sdui/widgets/business/hyperlocal_gig_grid.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
// Removed: import 'package:rizik_v4/features/connect/presentation/call_screen.dart'; - using RealtimeKit SDK now
import 'package:rizik_v4/features/ai/presentation/voice_mode_screen.dart';

class WidgetRegistry {
  // The registry now accepts BuildContext as the first argument
  static final Map<String, Widget Function(BuildContext, Map<String, dynamic>)> registry = {
    'container': (context, data) => _buildContainer(context, data),
    'column': (context, data) => _buildColumn(context, data),
    'row': (context, data) => _buildRow(context, data),
    'rizik_vertical_list': (context, data) => _buildColumn(context, data), // Alias for vertical list
    'text': (context, data) => _buildText(context, data),
    'center': (context, data) => _buildCenter(context, data),
    'sized_box': (context, data) => _buildSizedBox(context, data),
    'card': (context, data) => _buildCard(context, data),
    'image': (context, data) => _buildImage(context, data),
    'button': (context, data) => _buildButton(context, data),
    'icon': (context, data) => _buildIcon(context, data),
    'stack': (context, data) => _buildStack(context, data),
    'input_field': (context, data) => _buildInputField(context, data),
    // Composable SDUI widgets
    'rizik_trust_aura': (context, data) => WidgetTrustAura(data: data),
    'rizik_expense_summary': (context, data) => WidgetExpenseSummary(data: data),
    'rizik_aura_card': (context, data) => WidgetAuraCard(data: data),
    'rizik_mission_offer': (context, data) => WidgetMissionOffer(data: data),
    'rizik_dhaar_status': (context, data) => WidgetDhaarStatus(data: data),
    'rizik_float_monitor': (context, data) => WidgetFloatMonitor(data: data),
    'rizik_tribunal_case': (context, data) => WidgetTribunalCase(data: data),
    'rizik_duty_card': (context, data) => WidgetDutyCard(data: data),
    // Rizik Visuals
    'rizik_gradient_card': (context, data) => RizikGradientCard(data: data),
    'rizik_glass_card': (context, data) => RizikGlassCard(data: data),
    'rizik_anim_icon': (context, data) => RizikAnimIcon(data: data),
    'rizik_mojo': (context, data) => const RizikMojo(),
    // Bridge Widgets
    'money_bag_display': (context, data) => WidgetMoneybagDisplay(data: data),
    'money_bag': (context, data) => WidgetMoneybagDisplay(data: data), // Alias for SDUI
    'cart_display': (context, data) => WidgetCartDisplay(data: data),
    'cart_summary': (context, data) => WidgetCartDisplay(data: data), // Alias for SDUI
    'unified_wallet_display': (context, data) => WidgetUnifiedWalletDisplay(data: data),
    'trust_score_display': (context, data) => WidgetTrustScoreDisplay(data: data),
    'order_stats_display': (context, data) => WidgetOrderStatsDisplay(data: data),
    'mission_stats_display': (context, data) => WidgetMissionStatsDisplay(data: data),
    'squad_stats_display': (context, data) => WidgetSquadStatsDisplay(data: data),
    'inventory_stats_display': (context, data) => WidgetInventoryStatsDisplay(data: data),
    'shopping_stats_display': (context, data) => WidgetShoppingStatsDisplay(data: data),
    'profile_display': (context, data) => WidgetProfileDisplay(data: data),
    // Model-based Display Widgets
    'order_status_card': (context, data) => WidgetOrderStatusCard(data: data),
    'mission_card': (context, data) => WidgetMissionCard(data: data),
    'squad_card': (context, data) => WidgetSquadCard(data: data),
    // Business Widgets (Premium Design System)
    'money_bag_card': (context, data) => MoneyBagCard(data: data),
    'order_tracker': (context, data) => WidgetOrderTrackerDisplay(data: data), // Bridge to OrderProvider
    'order_tracker_display': (context, data) => WidgetOrderTrackerDisplay(data: data),
    'service_grid': (context, data) => ServiceGrid(data: data),
    'glass_card': (context, data) => RizikGlassCard(data: data),
    // V10 Foundation Widgets
    'dynamic_form': (context, data) => DynamicForm(data: data),
    'list_renderer': (context, data) => ListRenderer(data: data),
    'meal_toggle_card': (context, data) => MealToggleCard(data: data),
    'squad_tribunal_card': (context, data) => SquadTribunalCard(data: data),
    'mover_float_card': (context, data) => MoverFloatCard(data: data),
    'bazar_item_card': (context, data) => BazarItemCard(data: data),
    'family_care_alert': (context, data) => FamilyCareAlert(data: data),
    'savings_advisor_card': (context, data) => SavingsAdvisorCard(data: data),
    'asset_rental_card': (context, data) => AssetRentalCard(data: data),
    // Missing Features Widgets (Operation Missing Widgets Implementation)
    'bazar_feed_card': (context, data) => BazarFeedCard(data: data),
    'video_card': (context, data) => VideoCard(data: data),
    'negotiation_card': (context, data) => NegotiationCard(data: data),
    'storefront_card': (context, data) => StorefrontCard(data: data),
    'hyperlocal_service_card': (context, data) => HyperlocalServiceCard(data: data),
    'group_expense_card': (context, data) => GroupExpenseCard(data: data),
    'duty_roster_card': (context, data) => DutyRosterCard(data: data),
    'inventory_card': (context, data) => InventoryCard(data: data),
    'tohobil_health_card': (context, data) => TohobilHealthCard(data: data),
    // Mover Dashboard Widgets
    'float_status_card': (context, data) => FloatStatusCard(data: data),
    'mission_chain_alert': (context, data) => MissionChainAlert(data: data),
    'hyperlocal_gig_grid': (context, data) => HyperlocalGigGrid(data: data),
    // Mover Dashboard Widgets
    'float_status_card': (context, data) => FloatStatusCard(data: data),
    'mission_chain_alert': (context, data) => MissionChainAlert(data: data),
    'hyperlocal_gig_grid': (context, data) => HyperlocalGigGrid(data: data),
    // Cloudflare Ecosystem Widgets
    // 'rizik_connect_call': (context, data) => const CallScreen(), // Removed - using RealtimeKit SDK now
    'rizik_copilot_voice': (context, data) => const VoiceModeScreen(),
    // Aliases for SDUI Preview / Legacy compatibility
    'risk_money_force_data': (context, data) => WidgetFloatMonitor(data: data),
    'squad_tribunal_vote': (context, data) => WidgetTribunalCase(data: data),
    'hero_banner': (context, data) => _buildHeroBanner(context, data),
    'hero_banner': (context, data) => _buildHeroBanner(context, data),
    // 'service_grid': (context, data) => _buildServiceGrid(context, data), // Deprecated in favor of class-based widget
  };

  // Helper function to build widgets from the registry, replacing RizikRenderer
  // This assumes 'type' is always present in child data for lookup
  static Widget build(BuildContext context, String type, Map<String, dynamic> data) {
    print('Rendering Widget Type: $type'); // Debug log
    final builder = registry[type];
    if (builder == null) {
      print('Error: Unknown widget type: $type');
      return Container(
        padding: const EdgeInsets.all(8),
        color: Colors.red.withOpacity(0.1),
        child: Text('Unknown widget type: $type', style: const TextStyle(color: Colors.red)),
      );
    }
    try {
      return builder(context, data);
    } catch (e, stackTrace) {
      print('Error rendering widget $type: $e');
      print(stackTrace);
      return Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.red),
          color: Colors.red.withOpacity(0.1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, color: Colors.red),
            Text('Error rendering $type', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            Text(e.toString(), style: TextStyle(color: Colors.red, fontSize: 10)),
          ],
        ),
      );
    }
  }

  static Widget _buildContainer(BuildContext context, Map<String, dynamic> data) {
    return Container(
      color: _parseColor(data['color']),
      width: _parseDouble(data['width']),
      height: _parseDouble(data['height']),
      padding: _parseEdgeInsets(data['padding']),
      margin: _parseEdgeInsets(data['margin']),
      child: data['child'] != null ? build(context, data['child']['type'], data['child']) : null,
    );
  }

  static Widget _buildColumn(BuildContext context, Map<String, dynamic> data) {
    return Column(
      mainAxisAlignment: _parseMainAxisAlignment(data['mainAxisAlignment']),
      crossAxisAlignment: _parseCrossAxisAlignment(data['crossAxisAlignment']),
      children: (data['children'] as List<dynamic>? ?? [])
          .map((childData) => build(context, childData['type'], childData))
          .toList(),
    );
  }

  static Widget _buildRow(BuildContext context, Map<String, dynamic> data) {
    return Row(
      mainAxisAlignment: _parseMainAxisAlignment(data['mainAxisAlignment']),
      crossAxisAlignment: _parseCrossAxisAlignment(data['crossAxisAlignment']),
      children: (data['children'] as List<dynamic>? ?? [])
          .map((childData) => build(context, childData['type'], childData))
          .toList(),
    );
  }

  static Widget _buildText(BuildContext context, Map<String, dynamic> data) {
    return Text(
      data['text'] ?? '',
      style: TextStyle(
        color: _parseColor(data['color']),
        fontSize: _parseDouble(data['fontSize']),
        fontWeight: _parseFontWeight(data['fontWeight']),
      ),
      textAlign: _parseTextAlign(data['textAlign']),
    );
  }

  static Widget _buildCenter(BuildContext context, Map<String, dynamic> data) {
    return Center(
      child: data['child'] != null ? build(context, data['child']['type'], data['child']) : null,
    );
  }

  static Widget _buildSizedBox(BuildContext context, Map<String, dynamic> data) {
    return SizedBox(
      width: _parseDouble(data['width']),
      height: _parseDouble(data['height']),
    );
  }

  static Widget _buildCard(BuildContext context, Map<String, dynamic> data) {
    return Card(
      color: _parseColor(data['color']),
      elevation: _parseDouble(data['elevation']),
      margin: _parseEdgeInsets(data['margin']),
      shape: data['borderRadius'] != null
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(_parseDouble(data['borderRadius'])!),
            )
          : null,
      child: data['child'] != null 
          ? build(context, data['child']['type'], data['child']) 
          : (data['data'] != null && data['data']['title'] != null)
              ? ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: data['data']['icon'] != null 
                      ? Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: _parseColor(data['data']['iconColor'])?.withOpacity(0.1) ?? Colors.grey.shade100,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _parseIconData(data['data']['icon']), 
                            color: _parseColor(data['data']['iconColor']) ?? Colors.grey,
                          ),
                        )
                      : null,
                  title: Text(
                    data['data']['title'],
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: data['data']['subtitle'] != null 
                      ? Text(data['data']['subtitle']) 
                      : null,
                )
              : null,
    );
  }

  static Widget _buildImage(BuildContext context, Map<String, dynamic> data) {
    return Image.network(
      data['url'] ?? '',
      width: _parseDouble(data['width']),
      height: _parseDouble(data['height']),
      fit: _parseBoxFit(data['fit']),
    );
  }

  static Widget _buildButton(BuildContext context, Map<String, dynamic> data) {
    final action = data['action'];
    
    return GestureDetector(
      onTap: () async {
        if (action != null) {
          await _handleAction(context, action);
        }
      },
      child: Container(
        padding: _parseEdgeInsets(data['padding']),
        margin: _parseEdgeInsets(data['margin']),
        decoration: BoxDecoration(
          color: _parseColor(data['color']) ?? Colors.blue,
          borderRadius: BorderRadius.circular(8),
        ),
        child: data['child'] != null 
            ? build(context, data['child']['type'], data['child'])
            : const SizedBox.shrink(),
      ),
    );
  }

  static Future<void> _handleAction(BuildContext context, Map<String, dynamic> action) async {
    final type = (action['type'] as String?)?.toUpperCase();
    
    if (type == 'NAVIGATE') {
      final url = action['url'] as String?;
      final route = action['route'] as String?; // Support 'route' key as well
      final target = url ?? route;
      
      if (target != null) {
        print('🔘 SDUI Action: NAVIGATE to $target');
        try {
          // Use GoRouter for internal navigation
          if (target.startsWith('/')) {
             GoRouter.of(context).go(target);
          } else {
             // Fallback for legacy "Gig Details" drill-down (if needed)
             // Or handle external URLs here
             print('⚠️ Unhandled navigation target: $target');
          }
        } catch (e) {
          print('❌ Navigation Failed: $e');
          // The following lines were added based on the user's request.
          // Note: `data` and `targetId` are not defined in this scope.
          // This code block might require additional context or variable definitions
          // from the user's actual use case to be fully functional.
          // For now, it's inserted as faithfully as possible, with the obvious syntax error fixed.
          // print("Clipboard Paste: ${data!.text}");
          
          // Update Form State so the API call picks it up
          // final formManager = FormStateManager();
          // formManager.setValue(targetId, data.text!);
          
          // ScaffoldMessenger.of(context).showSnackBar(
          //    SnackBar(content: Text('Pasted: ${data.text}'), duration: const Duration(seconds: 1)),
          // );
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Navigation failed: $e'), backgroundColor: Colors.red),
            );
          }
        }
      }
    } else if (type == 'CALL_PROVIDER') {
      final providerName = action['provider'];
      final method = action['method'];
      
      if (providerName == 'RizikDhaarProvider' && method == 'submitLoanApplication') {
        final formManager = FormStateManager();
        final formData = formManager.getAllValues();
        
        try {
          // Real Provider Call
          await Provider.of<RizikDhaarProvider>(context, listen: false).submitLoanApplication(formData);
          
          if (context.mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Loan Application Submitted Successfully!'), backgroundColor: Colors.green),
            );
             formManager.clear();
          }
          
        } catch (e) {
           print('Provider Call Failed: $e');
           if (context.mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Submission Failed: $e'), backgroundColor: Colors.red),
            );
           }
        }
      }
    } else if (type == 'API_CALL') {
      final method = action['method'] as String?;
      final url = action['url'] as String?;
      final endpoint = action['endpoint'] as String?; // Support 'endpoint' key
      final targetUrl = url ?? endpoint;
      
      if (method == 'POST' && targetUrl != null) {
        final formManager = FormStateManager();
        final formData = formManager.getAllValues();
        
        // Convert form data to match backend expectations
        final body = {
          'fullName': formData['Full Name'] ?? '',
          'universityId': formData['University ID'] ?? '',
          ...formData, // Include all other form data
        };
        
        print('🔘 SDUI Action: API_CALL');
        print('   URL: $targetUrl');
        print('   Method: $method');
        print('   Body: $body');
        
        try {
          final response = await ApiService.submitApplication(targetUrl, body);
          
          // Show success message
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(response['message'] ?? 'Action successful!'),
                backgroundColor: Colors.green,
              ),
            );
            
            // Clear form
            formManager.clear();
          }
        } catch (e) {
          // Show error message
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Action failed: $e'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      }
    }
  }

  static Widget _buildIcon(BuildContext context, Map<String, dynamic> data) {
    return Icon(
      _parseIconData(data['icon']),
      color: _parseColor(data['color']),
      size: _parseDouble(data['size']),
    );
  }

  static Widget _buildStack(BuildContext context, Map<String, dynamic> data) {
    return Stack(
      alignment: _parseAlignment(data['alignment']) ?? AlignmentDirectional.topStart,
      children: (data['children'] as List<dynamic>? ?? [])
          .map((childData) => build(context, childData['type'], childData))
          .toList(),
    );
  }

  static Widget _buildInputField(BuildContext context, Map<String, dynamic> data) {
    final label = data['label'] as String?;
    final formManager = FormStateManager();
    
    return TextField(
      decoration: InputDecoration(
        labelText: label,
        hintText: data['hint'],
        border: const OutlineInputBorder(),
        filled: data['filled'] ?? false,
        fillColor: _parseColor(data['fillColor']),
      ),
      onChanged: (value) {
        if (label != null) {
          formManager.setValue(label, value);
        }
      },
    );
  }

  // Helper parsers
  static Color? _parseColor(String? color) {
    if (color == null) return null;
    if (color == 'red') return Colors.red;
    if (color == 'green') return Colors.green;
    if (color == 'blue') return Colors.blue;
    if (color == 'white') return Colors.white;
    if (color == 'black') return Colors.black;
    if (color.startsWith('#')) {
      return Color(int.parse(color.substring(1, 7), radix: 16) + 0xFF000000);
    }
    return null;
  }

  static double? _parseDouble(dynamic value) {
    if (value is int) return value.toDouble();
    if (value is double) return value;
    return null;
  }

  static EdgeInsetsGeometry? _parseEdgeInsets(dynamic value) {
    if (value is double || value is int) {
      return EdgeInsets.all(_parseDouble(value)!);
    }
    // TODO: Handle other formats like [l, t, r, b]
    return null;
  }

  static MainAxisAlignment _parseMainAxisAlignment(String? value) {
    switch (value) {
      case 'start': return MainAxisAlignment.start;
      case 'end': return MainAxisAlignment.end;
      case 'center': return MainAxisAlignment.center;
      case 'spaceBetween': return MainAxisAlignment.spaceBetween;
      case 'spaceAround': return MainAxisAlignment.spaceAround;
      case 'spaceEvenly': return MainAxisAlignment.spaceEvenly;
      default: return MainAxisAlignment.start;
    }
  }

  static CrossAxisAlignment _parseCrossAxisAlignment(String? value) {
    switch (value) {
      case 'start': return CrossAxisAlignment.start;
      case 'end': return CrossAxisAlignment.end;
      case 'center': return CrossAxisAlignment.center;
      case 'stretch': return CrossAxisAlignment.stretch;
      default: return CrossAxisAlignment.center;
    }
  }

  static TextAlign? _parseTextAlign(String? value) {
    switch (value) {
      case 'center': return TextAlign.center;
      case 'left': return TextAlign.left;
      case 'right': return TextAlign.right;
      default: return null;
    }
  }

  static FontWeight? _parseFontWeight(String? value) {
    switch (value) {
      case 'bold': return FontWeight.bold;
      case 'w500': return FontWeight.w500;
      default: return FontWeight.normal;
    }
  }

  static BoxFit? _parseBoxFit(String? value) {
    switch (value) {
      case 'cover': return BoxFit.cover;
      case 'contain': return BoxFit.contain;
      case 'fill': return BoxFit.fill;
      default: return null;
    }
  }

  static IconData? _parseIconData(String? value) {
    switch (value) {
      case 'home': return Icons.home;
      case 'person': return Icons.person;
      case 'work': return Icons.work;
      case 'school': return Icons.school;
      case 'add': return Icons.add;
      case 'search': return Icons.search;
      case 'arrow_forward': return Icons.arrow_forward;
      default: return Icons.help;
    }
  }

  static AlignmentGeometry? _parseAlignment(String? value) {
    switch (value) {
      case 'center': return Alignment.center;
      case 'bottomRight': return Alignment.bottomRight;
      case 'bottomLeft': return Alignment.bottomLeft;
      case 'topRight': return Alignment.topRight;
      case 'topLeft': return Alignment.topLeft;
      default: return null;
    }
  }

  static Widget _buildHeroBanner(BuildContext context, Map<String, dynamic> data) {
  final title = data['data']?['title'] ?? 'Welcome';
  final imageUrl = data['data']?['imageUrl'];
  
  return Container(
    width: double.infinity,
    height: 200,
    margin: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(16),
      color: Colors.black,
    ),
    clipBehavior: Clip.antiAlias,
    child: Stack(
      fit: StackFit.expand,
      children: [
        if (imageUrl != null)
          Image.network(
            imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                color: Colors.grey.shade800,
                child: const Center(
                  child: Icon(Icons.broken_image, color: Colors.white54),
                ),
              );
            },
          ),
        Container(
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.4),
          ),
        ),
        Center(
          child: Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    ),
  );
}
  static Widget _buildServiceGrid(BuildContext context, Map<String, dynamic> data) {
    final items = (data['data']?['items'] as List<dynamic>?)?.cast<String>() ?? [];
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.0,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        IconData icon;
        Color color;
        
        switch (item.toLowerCase()) {
          case 'food':
            icon = Icons.restaurant;
            color = Colors.orange;
            break;
          case 'parcel':
            icon = Icons.local_shipping;
            color = Colors.blue;
            break;
          case 'shop':
            icon = Icons.shopping_bag;
            color = Colors.purple;
            break;
          default:
            icon = Icons.category;
            color = Colors.grey;
        }

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: 8),
              Text(
                item,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

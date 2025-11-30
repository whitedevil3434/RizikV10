import 'package:flutter/material.dart';
import 'package:rizik_v4/data/remote/api_service.dart';
import 'package:rizik_v4/core/sdui/widget_registry.dart';

class ListRenderer extends StatefulWidget {
  final Map<String, dynamic> data;

  const ListRenderer({super.key, required this.data});

  @override
  State<ListRenderer> createState() => _ListRendererState();
}

class _ListRendererState extends State<ListRenderer> {
  List<dynamic> _items = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final endpoint = widget.data['source_api'] ?? widget.data['endpoint'];
    
    // Static items support
    if (widget.data['items'] != null) {
      setState(() {
        _items = widget.data['items'];
        _isLoading = false;
      });
      return;
    }

    if (endpoint == null) {
      setState(() {
        _error = 'No source_api or items provided';
        _isLoading = false;
      });
      return;
    }

    try {
      final items = await ApiService.fetchList(endpoint);
      setState(() {
        _items = items;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(child: Text('Error: $_error', style: const TextStyle(color: Colors.red)));
    }

    if (_items.isEmpty) {
      return const Center(child: Text('No items found'));
    }

    final layoutStyle = widget.data['layout_style'] ?? 'list';
    final itemWidgetType = widget.data['item_widget_type'];

    if (layoutStyle == 'grid') {
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.8,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: _items.length,
        itemBuilder: (context, index) => _buildItem(context, index, itemWidgetType),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _items.length,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: _buildItem(context, index, itemWidgetType),
      ),
    );
  }

  Widget _buildItem(BuildContext context, int index, String? itemWidgetType) {
    final itemData = _items[index];
    
    // If itemData is already a full widget definition (has 'type'), use it.
    if (itemData is Map<String, dynamic> && itemData.containsKey('type')) {
      return WidgetRegistry.build(context, itemData['type'], itemData);
    }
    
    // Otherwise, wrap it in the specified item_widget_type
    if (itemWidgetType != null) {
      final Map<String, dynamic> widgetData = <String, dynamic>{
        'data': itemData, // Pass raw data to the widget
      };
      
      if (itemData is Map) {
        widgetData.addAll(itemData.cast<String, dynamic>());
      }
      
      return WidgetRegistry.build(context, itemWidgetType, widgetData);
    }
    
    // Fallback: Text representation
    return Text(itemData.toString());
  }
}

import 'package:flutter/material.dart';

class MealToggleCard extends StatefulWidget {
  final Map<String, dynamic> data;

  const MealToggleCard({super.key, required this.data});

  @override
  State<MealToggleCard> createState() => _MealToggleCardState();
}

class _MealToggleCardState extends State<MealToggleCard> {
  bool _isMealOn = false;

  @override
  void initState() {
    super.initState();
    _isMealOn = widget.data['isMealOn'] ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Meal Status',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Switch(
                  value: _isMealOn,
                  activeColor: Colors.green,
                  onChanged: (value) {
                    setState(() {
                      _isMealOn = value;
                    });
                    // TODO: Call provider or API to update status
                    print('Meal status toggled to: $value');
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              _isMealOn ? 'You are currently receiving meals.' : 'Meal service is paused.',
              style: TextStyle(
                color: _isMealOn ? Colors.green : Colors.grey,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

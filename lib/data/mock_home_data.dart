final Map<String, dynamic> mockHomeData = {
  'type': 'container',
  'color': 'white',
  'child': {
    'type': 'column',
    'crossAxisAlignment': 'stretch',
    'children': [
      // Header
      {
        'type': 'container',
        'color': '#6200EE',
        'padding': 16,
        'child': {
          'type': 'column',
          'crossAxisAlignment': 'start',
          'children': [
            {
              'type': 'text',
              'text': 'Rizik V8',
              'color': 'white',
              'fontSize': 24,
              'fontWeight': 'bold',
            },
            {
              'type': 'text',
              'text': 'Youth Life Operating System',
              'color': 'white',
              'fontSize': 14,
            },
          ],
        },
      },
      // Spacing
      {'type': 'sized_box', 'height': 20},
      // Categories Title
      {
        'type': 'container',
        'padding': 16,
        'child': {
          'type': 'text',
          'text': 'Explore',
          'fontSize': 18,
          'fontWeight': 'bold',
          'color': 'black',
        },
      },
      // Categories Row
      {
        'type': 'row',
        'mainAxisAlignment': 'spaceEvenly',
        'children': [
          _buildCategoryItem('Major', '#FF5722'),
          _buildCategoryItem('League', '#4CAF50'),
          _buildCategoryItem('Bazar', '#2196F3'),
        ],
      },
      // Spacing
      {'type': 'sized_box', 'height': 20},
      // Feed Item 1
      _buildFeedItem('Law Student Gig', 'Legal advice for startups', '#E0E0E0'),
      {'type': 'sized_box', 'height': 10},
      // Feed Item 2
      _buildFeedItem('Marketing Help', 'Social media strategy', '#E0E0E0'),
    ],
  },
};

Map<String, dynamic> _buildCategoryItem(String title, String color) {
  return {
    'type': 'container',
    'width': 80,
    'height': 80,
    'color': color,
    'child': {
      'type': 'center',
      'child': {
        'type': 'text',
        'text': title,
        'color': 'white',
        'fontWeight': 'bold',
      },
    },
  };
}

Map<String, dynamic> _buildFeedItem(String title, String subtitle, String color) {
  return {
    'type': 'container',
    'margin': 16,
    'padding': 16,
    'color': color,
    'child': {
      'type': 'column',
      'crossAxisAlignment': 'start',
      'children': [
        {
          'type': 'text',
          'text': title,
          'fontSize': 16,
          'fontWeight': 'bold',
          'color': 'black',
        },
        {'type': 'sized_box', 'height': 4},
        {
          'type': 'text',
          'text': subtitle,
          'fontSize': 14,
          'color': 'black',
        },
      ],
    },
  };
}

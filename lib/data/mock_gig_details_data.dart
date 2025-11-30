final Map<String, dynamic> mockGigDetailsData = {
  'type': 'column',
  'crossAxisAlignment': 'stretch',
  'children': [
    // Hero Image Section
    {
      'type': 'stack',
      'alignment': 'bottomLeft',
      'children': [
        {
          'type': 'image',
          'url': 'https://placehold.co/600x400/png', // Placeholder
          'height': 200,
          'width': double.infinity,
          'fit': 'cover',
        },
        {
          'type': 'container',
          'color': '#80000000', // Semi-transparent black
          'padding': 16,
          'width': double.infinity,
          'child': {
            'type': 'text',
            'text': 'Legal Consultant for SME',
            'color': 'white',
            'fontSize': 22,
            'fontWeight': 'bold',
          },
        },
      ],
    },
    // Content Body
    {
      'type': 'container',
      'padding': 16,
      'child': {
        'type': 'column',
        'crossAxisAlignment': 'start',
        'children': [
          // Tags
          {
            'type': 'row',
            'children': [
              _buildTag('Law Student', '#E1BEE7', '#4A148C'),
              {'type': 'sized_box', 'width': 8},
              _buildTag('Remote', '#C8E6C9', '#1B5E20'),
            ],
          },
          {'type': 'sized_box', 'height': 16},
          // Description
          {
            'type': 'text',
            'text': 'Description',
            'fontSize': 18,
            'fontWeight': 'bold',
          },
          {'type': 'sized_box', 'height': 8},
          {
            'type': 'text',
            'text': 'We are looking for a 3rd or 4th year law student to help draft basic contracts for our new startup. Must have knowledge of commercial law.',
            'fontSize': 14,
            'color': '#616161',
          },
          {'type': 'sized_box', 'height': 24},
          // Application Form
          {
            'type': 'card',
            'elevation': 4,
            'padding': 16,
            'child': {
              'type': 'column',
              'crossAxisAlignment': 'start',
              'children': [
                {
                  'type': 'text',
                  'text': 'Apply for this Gig',
                  'fontSize': 18,
                  'fontWeight': 'bold',
                },
                {'type': 'sized_box', 'height': 16},
                {
                  'type': 'input_field',
                  'label': 'Full Name',
                  'hint': 'Enter your name',
                },
                {'type': 'sized_box', 'height': 12},
                {
                  'type': 'input_field',
                  'label': 'University ID',
                  'hint': 'e.g. 18101123',
                },
                {'type': 'sized_box', 'height': 16},
                {
                  'type': 'button',
                  'color': '#6200EE',
                  'padding': 16,
                  'child': {
                    'type': 'center',
                    'child': {
                      'type': 'text',
                      'text': 'Submit Application',
                      'color': 'white',
                      'fontWeight': 'bold',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

Map<String, dynamic> _buildTag(String text, String bgColor, String textColor) {
  return {
    'type': 'container',
    'color': bgColor,
    'padding': 8,
    'child': {
      'type': 'text',
      'text': text,
      'color': textColor,
      'fontSize': 12,
      'fontWeight': 'bold',
    },
  };
}

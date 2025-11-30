/// Mock data for home_force screen showcasing composable SDUI widgets
final Map<String, dynamic> mockHomeForceSdui = {
  'type': 'column',
  'children': [
    // Header Section
    {
      'type': 'container',
      'padding': 24.0,
      'color': '#7C4DFF',
      'child': {
        'type': 'column',
        'crossAxisAlignment': 'start',
        'children': [
          {
            'type': 'text',
            'text': 'রিজিক ফোর্স 🚀',
            'color': 'white',
            'fontSize': 28.0,
            'fontWeight': 'bold',
          },
          {
            'type': 'sized_box',
            'height': 8.0,
          },
          {
            'type': 'text',
            'text': 'আপনার ড্যাশবোর্ড',
            'color': 'white',
            'fontSize': 16.0,
          },
        ],
      },
    },
    
    // Scrollable Content (wrap in SingleChildScrollView in real app)
    {
      'type': 'container',
      'padding': 16.0,
      'child': {
        'type': 'column',
        'children': [
          // Trust Aura Widget
          {
            'type': 'rizik_trust_aura',
            'profileId': 'user_123',
            'showCategories': true,
            'compact': false,
          },
          
          {
            'type': 'sized_box',
            'height': 16.0,
          },
          
          // Expense Summary Widget
          {
            'type': 'rizik_expense_summary',
            'groupId': 'squad_456',
            'showCategories': true,
            'limit': 5,
          },
          
          {
            'type': 'sized_box',
            'height': 16.0,
          },
          
          // Action Section
          {
            'type': 'card',
            'elevation': 2.0,
            'margin': 0.0,
            'borderRadius': 12.0,
            'child': {
              'type': 'container',
              'padding': 16.0,
              'child': {
                'type': 'column',
                'children': [
                  {
                    'type': 'text',
                    'text': '⚡ দ্রুত কর্ম',
                    'fontSize': 18.0,
                    'fontWeight': 'bold',
                  },
                  {
                    'type': 'sized_box',
                    'height': 12.0,
                  },
                  {
                    'type': 'row',
                    'mainAxisAlignment': 'spaceEvenly',
                    'children': [
                      {
                        'type': 'button',
                        'padding': 12.0,
                        'color': '#66BB6A',
                        'child': {
                          'type': 'column',
                          'children': [
                            {
                              'type': 'icon',
                              'icon': 'add',
                              'color': 'white',
                              'size': 24.0,
                            },
                            {
                              'type': 'sized_box',
                              'height': 4.0,
                            },
                            {
                              'type': 'text',
                              'text': 'অর্ডার',
                              'color': 'white',
                              'fontSize': 12.0,
                            },
                          ],
                        },
                      },
                      {
                        'type': 'button',
                        'padding': 12.0,
                        'color': '#FFC107',
                        'child': {
                          'type': 'column',
                          'children': [
                            {
                              'type': 'icon',
                              'icon': 'person',
                              'color': 'white',
                              'size': 24.0,
                            },
                            {
                              'type': 'sized_box',
                              'height': 4.0,
                            },
                            {
                              'type': 'text',
                              'text': 'প্রোফাইল',
                              'color': 'white',
                              'fontSize': 12.0,
                            },
                          ],
                        },
                      },
                      {
                        'type': 'button',
                        'padding': 12.0,
                        'color': '#EF5350',
                        'child': {
                          'type': 'column',
                          'children': [
                            {
                              'type': 'icon',
                              'icon': 'work',
                              'color': 'white',
                              'size': 24.0,
                            },
                            {
                              'type': 'sized_box',
                              'height': 4.0,
                            },
                            {
                              'type': 'text',
                              'text': 'মিশন',
                              'color': 'white',
                              'fontSize': 12.0,
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
          
          {
            'type': 'sized_box',
            'height': 24.0,
          },
          
          // Info Section
          {
            'type': 'container',
            'padding': 16.0,
            'color': '#E8F5E9',
            'child': {
              'type': 'column',
              'crossAxisAlignment': 'start',
              'children': [
                {
                  'type': 'text',
                  'text': '✨ নতুন ফিচার',
                  'fontSize': 14.0,
                  'fontWeight': 'bold',
                  'color': '#388E3C',
                },
                {
                  'type': 'sized_box',
                  'height': 8.0,
                },
                {
                  'type': 'text',
                  'text': 'এখন আপনার ট্রাস্ট স্কোর এবং গ্রুপ খরচ একই জায়গায় দেখতে পারবেন!',
                  'fontSize': 13.0,
                  'color': '#1B5E20',
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

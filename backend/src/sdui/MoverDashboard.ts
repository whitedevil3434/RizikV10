
export async function buildMoverDashboard(
    supabaseUrl: string,
    supabaseKey: string,
    squadId: string,
    userId: string
) {
    // 1. Mock Mover Data (Float & Mission Chain)
    // In a real scenario, we would fetch this from Supabase
    const moverData = {
        float_balance: 1500, // Micro-Float
        float_limit: 2000,
        status: 'ACTIVE',
        mission_chain: {
            has_next: true,
            next_task: 'Pickup Parcel from Daraz Hub',
            eta: '15 mins',
            priority: 'HIGH'
        }
    }

    // 2. Construct the SDUI JSON
    return {
        type: 'screen',
        appBar: {
            title: 'Rizik Force',
            actions: [
                {
                    type: 'icon',
                    icon: 'notifications',
                    action: {
                        type: 'navigate',
                        url: '/notifications'
                    }
                }
            ]
        },
        floatingActionButton: {
            type: 'floating_action_button',
            icon: 'swap_horiz',
            label: 'Switch Role',
            backgroundColor: '#6200EE', // Brand Purple
            action: {
                type: 'modal',
                child: {
                    type: 'column',
                    mainAxisSize: 'min',
                    children: [
                        {
                            type: 'text',
                            text: 'Switch Perspective',
                            style: 'h3',
                            padding: { bottom: 16 }
                        },
                        {
                            type: 'button',
                            label: 'Switch to Seeker (Consumer)',
                            style: 'outlined',
                            action: {
                                type: 'navigate',
                                url: '/seeker/dashboard'
                            }
                        },
                        { type: 'sized_box', height: 12 },
                        {
                            type: 'button',
                            label: 'Switch to Maker (Source)',
                            style: 'outlined',
                            action: {
                                type: 'navigate',
                                url: '/maker/dashboard'
                            }
                        }
                    ]
                }
            }
        },
        child: {
            type: 'scroll_view',
            child: {
                type: 'column',
                crossAxisAlignment: 'stretch',
                padding: { left: 16, right: 16, top: 16, bottom: 80 }, // Bottom padding for FAB
                children: [
                    // 1. Float Status Card (Capital Management)
                    {
                        type: 'float_status_card',
                        data: {
                            balance: moverData.float_balance,
                            limit: moverData.float_limit,
                            status: moverData.status,
                            action: {
                                type: 'navigate',
                                url: '/wallet/topup'
                            }
                        }
                    },
                    { type: 'sized_box', height: 24 },

                    // 2. Mission Chain Alert (Logistics Optimization)
                    {
                        type: 'mission_chain_alert',
                        data: {
                            visible: moverData.mission_chain.has_next,
                            task: moverData.mission_chain.next_task,
                            eta: moverData.mission_chain.eta,
                            priority: moverData.mission_chain.priority,
                            action: {
                                type: 'navigate',
                                url: '/mission/active'
                            }
                        }
                    },
                    { type: 'sized_box', height: 24 },

                    // 3. Hyperlocal Gig Grid (Micro-Gigs)
                    {
                        type: 'row',
                        mainAxisAlignment: 'spaceBetween',
                        children: [
                            {
                                type: 'text',
                                text: 'Nearby Gigs',
                                style: 'h3'
                            },
                            {
                                type: 'text_button',
                                label: 'See All',
                                action: {
                                    type: 'navigate',
                                    url: '/gigs/all'
                                }
                            }
                        ]
                    },
                    { type: 'sized_box', height: 12 },
                    {
                        type: 'hyperlocal_gig_grid',
                        data: {
                            gigs: [
                                {
                                    id: 'gig_1',
                                    title: 'Tyre Repair',
                                    location: 'Road 10 (0.2km)',
                                    payout: '40 BDT',
                                    image: 'https://cdn-icons-png.flaticon.com/512/3096/3096673.png',
                                    action: { type: 'navigate', url: '/gig/gig_1' }
                                },
                                {
                                    id: 'gig_2',
                                    title: 'Bicycle Rental',
                                    location: 'Park Gate (0.5km)',
                                    payout: '20 BDT/hr',
                                    image: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
                                    action: { type: 'navigate', url: '/gig/gig_2' }
                                },
                                {
                                    id: 'gig_3',
                                    title: 'Parcel Drop',
                                    location: 'Sector 4 (1.2km)',
                                    payout: '60 BDT',
                                    image: 'https://cdn-icons-png.flaticon.com/512/2942/2942821.png',
                                    action: { type: 'navigate', url: '/gig/gig_3' }
                                },
                                {
                                    id: 'gig_4',
                                    title: 'Food Delivery',
                                    location: 'KFC (0.8km)',
                                    payout: '50 BDT',
                                    image: 'https://cdn-icons-png.flaticon.com/512/7541/7541900.png',
                                    action: { type: 'navigate', url: '/gig/gig_4' }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }
}

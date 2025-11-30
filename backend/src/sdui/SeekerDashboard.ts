
import { get_squad_financial_health } from '../services/FinancialAccountability'

export async function buildSeekerDashboard(
    supabaseUrl: string,
    supabaseKey: string,
    squadId: string, // Seeker's household ID
    userId: string
) {
    // 1. Fetch Household Financial Data (Smart Shongshar Khata)
    // Reusing squad financial health for household context
    let financialHealth = { tohobil_balance: 0, rent_due_days: 0, status: 'UNKNOWN' }
    try {
        if (squadId) {
            financialHealth = await get_squad_financial_health(supabaseUrl, supabaseKey, squadId)
        }
    } catch (e) {
        console.error('Failed to fetch household finance', e)
    }

    // 2. Mock Family Care / Rota Alert
    // In real implementation, we'd check OperationalEngine for 'Care' type duties
    const careAlert = {
        has_alert: true,
        message: 'Grandma needs medicine at 2 PM',
        action_label: 'View Rota'
    }

    // 3. Construct the SDUI JSON
    return {
        type: 'screen',
        appBar: {
            title: 'Rizik Home',
            actions: [
                { type: 'icon', icon: 'notifications', action: { type: 'navigate', url: '/notifications' } }
            ]
        },
        child: {
            type: 'scroll_view',
            child: {
                type: 'column',
                crossAxisAlignment: 'stretch',
                children: [
                    // 1. AI Search Bar (Voice-to-Action Trigger)
                    {
                        type: 'container',
                        padding: 16,
                        child: {
                            type: 'search_bar',
                            hint: 'Ask Rizik (e.g., "Ami ki khabo?")',
                            on_submit: {
                                type: 'api_call',
                                url: '/api/ai/chat',
                                method: 'POST',
                                body: {
                                    squad_id: squadId,
                                    user_id: userId,
                                    // message will be injected by the frontend from input
                                    message: '${input}'
                                }
                            }
                        }
                    },

                    // 2. Savings Advisor Card (Smart Shongshar)
                    {
                        type: 'savings_advisor_card',
                        data: {
                            current_savings: financialHealth.tohobil_balance,
                            monthly_target: 5000,
                            status: financialHealth.status, // e.g., 'HEALTHY' or 'CRITICAL'
                            tip: 'You saved 500 BDT this week on groceries!'
                        }
                    },
                    { type: 'sized_box', height: 16 },

                    // 3. Family Care Alert
                    {
                        type: 'family_care_alert',
                        data: {
                            visible: careAlert.has_alert,
                            message: careAlert.message,
                            icon: 'medical_services',
                            action: {
                                type: 'navigate',
                                url: '/rota/care'
                            }
                        }
                    },
                    { type: 'sized_box', height: 16 },

                    // 4. Hyperlocal Service Grid
                    {
                        type: 'text',
                        text: 'Services Near You',
                        style: 'h3',
                        padding: { left: 16, bottom: 8 }
                    },
                    {
                        type: 'hyperlocal_service_grid',
                        data: {
                            services: [
                                {
                                    id: 'srv_1',
                                    name: 'Bata Mosla',
                                    image: 'https://example.com/spices.png',
                                    price: '50 BDT',
                                    action: { type: 'navigate', url: '/service/srv_1' }
                                },
                                {
                                    id: 'srv_2',
                                    name: 'Baby Sitting',
                                    image: 'https://example.com/baby.png',
                                    price: '200 BDT/hr',
                                    action: { type: 'navigate', url: '/service/srv_2' }
                                },
                                {
                                    id: 'srv_3',
                                    name: 'Home Cleaner',
                                    image: 'https://example.com/cleaner.png',
                                    price: '300 BDT',
                                    action: { type: 'navigate', url: '/service/srv_3' }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }
}

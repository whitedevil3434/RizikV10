
import { get_squad_financial_health } from '../services/FinancialAccountability'
import { generate_daily_rota } from '../services/OperationalEngine'

export async function buildMakerDashboard(
    supabaseUrl: string,
    supabaseKey: string,
    squadId: string,
    userId: string
) {
    // 1. Fetch Real-time Financial Data
    let financialHealth = { tohobil_balance: 0, rent_due_days: 0, status: 'UNKNOWN' }
    try {
        financialHealth = await get_squad_financial_health(supabaseUrl, supabaseKey, squadId)
    } catch (e) {
        console.error('Failed to fetch financial health', e)
    }

    // 2. Fetch Operational Data (Simulated for V1 Blueprint)
    // In a real scenario, we'd call a getter from OperationalEngine
    const dutyData = {
        current_duty: 'Chef',
        assignee: 'You',
        status: 'Active',
        next_task: 'Cleaner',
        time_remaining: '2h 30m'
    }

    // 3. Construct the SDUI JSON
    return {
        type: 'screen',
        appBar: {
            title: 'Maker Dashboard',
            actions: [
                {
                    type: 'icon',
                    icon: 'settings',
                    action: {
                        type: 'modal',
                        // The "Hidden" Liquidation Trigger
                        child: {
                            type: 'column',
                            children: [
                                {
                                    type: 'text',
                                    text: 'Advanced Squad Settings',
                                    style: 'h2'
                                },
                                {
                                    type: 'button',
                                    text: '⚠️ TRIGGER LIQUIDATION (DANGER)',
                                    color: 'red',
                                    action: {
                                        type: 'api_call',
                                        url: '/api/squad/liquidation/report',
                                        method: 'POST',
                                        body: {
                                            squad_id: squadId,
                                            leaving_user_id: userId
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        },
        child: {
            type: 'scroll_view',
            child: {
                type: 'column',
                crossAxisAlignment: 'stretch',
                children: [
                    // 1. Financial Health Section
                    {
                        type: 'tohobil_health_card',
                        data: {
                            balance: financialHealth.tohobil_balance,
                            days_remaining: financialHealth.rent_due_days,
                            status: financialHealth.status
                        }
                    },
                    { type: 'sized_box', height: 16 },

                    // 2. Operational Section (Duty Rota)
                    {
                        type: 'duty_roster_card',
                        data: {
                            role: dutyData.current_duty,
                            assignee: dutyData.assignee,
                            status: dutyData.status,
                            next_task: dutyData.next_task,
                            timer: dutyData.time_remaining,
                            // Action to complete task
                            primary_action: {
                                label: 'Mark as Done',
                                action: {
                                    type: 'api_call',
                                    url: '/api/squad/task/complete',
                                    method: 'POST',
                                    body: {
                                        squad_id: squadId,
                                        duty_id: 'current_duty_id_123', // Mock ID
                                        status: 'completed'
                                    }
                                }
                            }
                        }
                    },
                    { type: 'sized_box', height: 16 },

                    // 3. Growth / Franchise Section (Placeholder for future)
                    {
                        type: 'card',
                        child: {
                            type: 'column',
                            children: [
                                { type: 'text', text: 'Franchise Expansion', style: 'h3' },
                                { type: 'text', text: 'Clone this squad model to start a new branch.' },
                                {
                                    type: 'button',
                                    text: 'Clone Squad',
                                    action: {
                                        type: 'navigate',
                                        url: '/franchise/create'
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }
}

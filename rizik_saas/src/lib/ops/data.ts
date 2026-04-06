import { createAdminClient } from "@/lib/supabase/client";

export interface OpsProduct {
  product_id: string;
  sku: string;
  name: string;
  category: string;
  description: string | null;
  base_price_bdt: number;
  minimum_order_quantity: number;
  image_url: string | null;
  image_alt: string | null;
  brand_family: string | null;
  is_active: boolean;
}

export interface OpsOrder {
  id: string;
  order_code: string;
  customer_name: string;
  channel: string;
  product_sku: string | null;
  quantity: number;
  unit_price_bdt: number;
  status: string;
  sla_state: string;
  expected_delivery_at: string | null;
  created_at: string;
  user_id?: string; // Digital order owner
  trxid?: string;  // Payment proof
}

export interface OpsSupportTicket {
  id: string;
  ticket_code: string;
  customer_name: string;
  account_type: string;
  topic: string;
  status: string;
  priority: string;
  latest_request: string | null;
  assigned_team: string | null;
  updated_at: string;
}

export interface OpsTask {
  id: string;
  title: string;
  owner_team: string | null;
  status: string;
  due_at: string | null;
  updated_at: string;
}

export interface OpsRequest {
  id: string;
  request_code: string;
  request_type: string;
  owner_team: string | null;
  status: string;
  updated_at: string;
}

export interface OpsShipment {
  id: string;
  shipment_code: string;
  route_text: string;
  customer_name: string;
  status: string;
  eta_at: string | null;
  updated_at: string;
}

export interface OpsInventoryItem {
  id: string;
  sku: string;
  item_name: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_name: string;
  updated_at: string;
}

export interface OpsNotification {
  id: string;
  audience: string;
  level: string;
  title: string;
  body: string;
  source: string | null;
  created_at: string;
}

export interface OpsDailyReport {
  id: string;
  employee_name: string;
  report_date: string;
  summary: string;
  sales_count: number;
  orders_handled: number;
  issues_encountered: string | null;
  created_at: string;
}

export interface AdminDashboardData {
  revenue_mtd: number;
  active_orders: number;
  open_tickets: number;
  line_utilization_pct: number;
  notifications: OpsNotification[];
  priority_board: Array<{ owner: string; task: string; eta: string; status: string }>;
}

export interface PortalDashboardData {
  assigned_tasks: number;
  high_priority_tasks: number;
  open_requests: number;
  active_shipments: number;
  team_availability_pct: number;
  feed: Array<{ time: string; title: string; detail: string }>;
  notifications: OpsNotification[];
  has_daily_report: boolean;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toDhakaTime(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export async function getStoreProducts(): Promise<OpsProduct[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("empire_products")
      .select("product_id, sku, name, category, description, base_price_bdt, minimum_order_quantity, image_url, image_alt, brand_family, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      product_id: String(row.product_id || ""),
      sku: String(row.sku || ""),
      name: String(row.name || ""),
      category: String(row.category || "OTHER"),
      description: row.description == null ? null : String(row.description),
      base_price_bdt: toNumber(row.base_price_bdt),
      minimum_order_quantity: Math.max(1, Math.floor(toNumber(row.minimum_order_quantity))),
      image_url: row.image_url == null ? null : String(row.image_url),
      image_alt: row.image_alt == null ? null : String(row.image_alt),
      brand_family: row.brand_family == null ? null : String(row.brand_family),
      is_active: Boolean(row.is_active),
    }));
  } catch {
    return [];
  }
}

export async function getStoreProductBySlug(slug: string): Promise<OpsProduct | null> {
  const products = await getStoreProducts();
  const normalizedSlug = slug.trim().toLowerCase();
  return products.find((product) => product.sku.toLowerCase() === normalizedSlug) || null;
}

export async function getOrders(limit = 80): Promise<OpsOrder[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_order_records")
      .select("id, order_code, customer_name, channel, product_sku, quantity, unit_price_bdt, status, sla_state, expected_delivery_at, created_at, user_id, trxid")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      order_code: String(row.order_code || ""),
      customer_name: String(row.customer_name || ""),
      channel: String(row.channel || "B2C"),
      product_sku: row.product_sku == null ? null : String(row.product_sku),
      quantity: Math.max(1, Math.floor(toNumber(row.quantity))),
      unit_price_bdt: toNumber(row.unit_price_bdt),
      status: String(row.status || "PENDING"),
      sla_state: String(row.sla_state || "ON_TRACK"),
      expected_delivery_at: row.expected_delivery_at == null ? null : String(row.expected_delivery_at),
      created_at: String(row.created_at || new Date().toISOString()),
      user_id: row.user_id ? String(row.user_id) : undefined,
      trxid: row.trxid ? String(row.trxid) : undefined,
    }));
  } catch {
    return [];
  }
}

export async function getOrderById(id: string): Promise<OpsOrder | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_order_records")
      .select("id, order_code, customer_name, channel, product_sku, quantity, unit_price_bdt, status, sla_state, expected_delivery_at, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as Record<string, unknown>;

    return {
      id: String(row.id || ""),
      order_code: String(row.order_code || ""),
      customer_name: String(row.customer_name || ""),
      channel: String(row.channel || "B2C"),
      product_sku: row.product_sku == null ? null : String(row.product_sku),
      quantity: Math.max(1, Math.floor(toNumber(row.quantity))),
      unit_price_bdt: toNumber(row.unit_price_bdt),
      status: String(row.status || "PENDING"),
      sla_state: String(row.sla_state || "ON_TRACK"),
      expected_delivery_at: row.expected_delivery_at == null ? null : String(row.expected_delivery_at),
      created_at: String(row.created_at || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export async function getSupportTickets(limit = 50): Promise<OpsSupportTicket[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_support_tickets")
      .select("id, ticket_code, customer_name, account_type, topic, status, priority, latest_request, assigned_team, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      ticket_code: String(row.ticket_code || ""),
      customer_name: String(row.customer_name || ""),
      account_type: String(row.account_type || "B2C"),
      topic: String(row.topic || ""),
      status: String(row.status || "OPEN"),
      priority: String(row.priority || "P2"),
      latest_request: row.latest_request == null ? null : String(row.latest_request),
      assigned_team: row.assigned_team == null ? null : String(row.assigned_team),
      updated_at: String(row.updated_at || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getEmployeeTasks(limit = 80, team?: string): Promise<OpsTask[]> {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("rizik_employee_tasks")
      .select("id, title, owner_team, status, due_at, updated_at");

    if (team) {
      query = query.eq("owner_team", team);
    }

    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      title: String(row.title || ""),
      owner_team: row.owner_team == null ? null : String(row.owner_team),
      status: String(row.status || "TODO"),
      due_at: row.due_at == null ? null : String(row.due_at),
      updated_at: String(row.updated_at || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getOpsRequests(limit = 50): Promise<OpsRequest[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_ops_requests")
      .select("id, request_code, request_type, owner_team, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      request_code: String(row.request_code || ""),
      request_type: String(row.request_type || ""),
      owner_team: row.owner_team == null ? null : String(row.owner_team),
      status: String(row.status || "APPROVAL_PENDING"),
      updated_at: String(row.updated_at || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getShipments(limit = 60): Promise<OpsShipment[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_shipments")
      .select("id, shipment_code, route_text, customer_name, status, eta_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      shipment_code: String(row.shipment_code || ""),
      route_text: String(row.route_text || ""),
      customer_name: String(row.customer_name || ""),
      status: String(row.status || "READY_FOR_PICKUP"),
      eta_at: row.eta_at == null ? null : String(row.eta_at),
      updated_at: String(row.updated_at || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getInventoryItems(limit = 40): Promise<OpsInventoryItem[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_inventory_items")
      .select("id, sku, item_name, quantity_on_hand, reorder_level, unit_name, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      sku: String(row.sku || ""),
      item_name: String(row.item_name || ""),
      quantity_on_hand: Math.max(0, Math.floor(toNumber(row.quantity_on_hand))),
      reorder_level: Math.max(0, Math.floor(toNumber(row.reorder_level))),
      unit_name: String(row.unit_name || "unit"),
      updated_at: String(row.updated_at || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getNotifications(audience: "ADMIN" | "EMPLOYEE" | "BOTH", limit = 20): Promise<OpsNotification[]> {
  try {
    const admin = createAdminClient();
    const filters = audience === "BOTH" ? ["BOTH", "ADMIN", "EMPLOYEE"] : ["BOTH", audience];

    const { data, error } = await admin
      .from("rizik_notifications")
      .select("id, audience, level, title, body, source, created_at")
      .in("audience", filters)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id || ""),
      audience: String(row.audience || "BOTH"),
      level: String(row.level || "INFO"),
      title: String(row.title || ""),
      body: String(row.body || ""),
      source: row.source == null ? null : String(row.source),
      created_at: String(row.created_at || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [orders, tickets, tasks, notifications] = await Promise.all([
    getOrders(120),
    getSupportTickets(50),
    getEmployeeTasks(80),
    getNotifications("ADMIN", 20),
  ]);

  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  const revenueMtd = orders
    .filter((order) => {
      const created = new Date(order.created_at);
      return created.getUTCMonth() === currentMonth && created.getUTCFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + order.quantity * order.unit_price_bdt, 0);

  const activeOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length;
  const openTickets = tickets.filter((ticket) => ticket.status !== "RESOLVED").length;
  const activeTasks = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const lineUtilization = tasks.length > 0 ? Math.round((activeTasks / tasks.length) * 100) : 0;

  const priorityBoard = [
    ...orders
      .filter((order) => ["RISK", "WATCH"].includes(order.sla_state))
      .slice(0, 3)
      .map((order) => ({
        owner: "Logistics",
        task: `Order ${order.order_code} for ${order.customer_name} requires SLA action`,
        eta: toDhakaTime(order.expected_delivery_at),
        status: order.sla_state,
      })),
    ...tickets
      .filter((ticket) => ticket.status !== "RESOLVED")
      .slice(0, 3)
      .map((ticket) => ({
        owner: ticket.assigned_team || "Support",
        task: `${ticket.topic} (${ticket.ticket_code})`,
        eta: toDhakaTime(ticket.updated_at),
        status: ticket.priority,
      })),
  ].slice(0, 6);

  return {
    revenue_mtd: revenueMtd,
    active_orders: activeOrders,
    open_tickets: openTickets,
    line_utilization_pct: lineUtilization,
    notifications,
    priority_board: priorityBoard,
  };
}

export async function getPortalDashboardData(): Promise<PortalDashboardData> {
  const [tasks, requests, shipments, notifications] = await Promise.all([
    getEmployeeTasks(80),
    getOpsRequests(50),
    getShipments(50),
    getNotifications("EMPLOYEE", 20),
  ]);

  const assignedTasks = tasks.filter((task) => task.status !== "DONE").length;
  const highPriorityTasks = tasks.filter((task) => {
    if (!task.due_at) return false;
    return new Date(task.due_at).getTime() - Date.now() <= 2 * 60 * 60 * 1000;
  }).length;

  const openRequests = requests.filter((request) => request.status !== "APPROVED" && request.status !== "CLOSED").length;
  const activeShipments = shipments.filter((shipment) => !["DELIVERED", "CANCELLED"].includes(shipment.status)).length;
  const teamAvailability = Math.max(0, Math.min(100, 100 - Math.round((highPriorityTasks / Math.max(assignedTasks, 1)) * 25)));

  // Check if daily report already submitted today
  const admin = createAdminClient();
  const { data: reportToday } = await admin
    .from("rizik_daily_reports")
    .select("id")
    .eq("report_date", new Date().toISOString().split("T")[0])
    .limit(1);

  const feed = [
    ...tasks.slice(0, 3).map((task) => ({
      time: toDhakaTime(task.updated_at),
      title: task.title,
      detail: `${task.owner_team || "Operations"} · ${task.status}`,
    })),
    ...requests.slice(0, 2).map((request) => ({
      time: toDhakaTime(request.updated_at),
      title: `${request.request_type} (${request.request_code})`,
      detail: `${request.owner_team || "Operations"} · ${request.status}`,
    })),
  ].slice(0, 6);

  return {
    assigned_tasks: assignedTasks,
    high_priority_tasks: highPriorityTasks,
    open_requests: openRequests,
    active_shipments: activeShipments,
    team_availability_pct: teamAvailability,
    feed,
    notifications,
    has_daily_report: !!reportToday && reportToday.length > 0,
  };
}

export async function getDailyReports(limit = 100): Promise<OpsDailyReport[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_daily_reports")
      .select(`
        id,
        report_date,
        summary,
        sales_count,
        orders_handled,
        issues_encountered,
        created_at,
        rizik_employees (
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as any[]).map((row) => ({
      id: row.id,
      employee_name: row.rizik_employees?.full_name || "Unknown",
      report_date: row.report_date,
      summary: row.summary,
      sales_count: row.sales_count,
      orders_handled: row.orders_handled,
      issues_encountered: row.issues_encountered,
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}


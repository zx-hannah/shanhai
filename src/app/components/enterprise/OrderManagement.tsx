import { useState } from "react";
import { Search, FileText, CheckCircle, Clock, XCircle, Eye, PenTool } from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "审核中" | "已通过" | "已驳回";

interface Order {
  id: string;
  orderNumber: string;
  planName: string;
  createdTime: string;
  amount: number;
  status: OrderStatus;
}

const INITIAL_ORDERS: Order[] = [
  { id: "1", orderNumber: "ORD-20240401-001", planName: "标准套餐", createdTime: "2024-04-01 10:30", amount: 399, status: "审核中" },
  { id: "2", orderNumber: "ORD-20240328-002", planName: "专业套餐", createdTime: "2024-03-28 14:20", amount: 999, status: "已通过" },
  { id: "3", orderNumber: "ORD-20240325-003", planName: "基础套餐", createdTime: "2024-03-25 09:15", amount: 99, status: "已通过" },
  { id: "4", orderNumber: "ORD-20240320-004", planName: "企业套餐", createdTime: "2024-03-20 16:45", amount: 5000, status: "已驳回" },
  { id: "5", orderNumber: "ORD-20240318-005", planName: "标准套餐", createdTime: "2024-03-18 11:00", amount: 399, status: "已通过" },
  { id: "6", orderNumber: "ORD-20240315-006", planName: "免费套餐", createdTime: "2024-03-15 08:30", amount: 0, status: "已通过" },
  { id: "7", orderNumber: "ORD-20240312-007", planName: "专业套餐", createdTime: "2024-03-12 13:50", amount: 999, status: "审核中" },
  { id: "8", orderNumber: "ORD-20240308-008", planName: "基础套餐", createdTime: "2024-03-08 15:20", amount: 99, status: "已驳回" },
  { id: "9", orderNumber: "ORD-20240305-009", planName: "标准套餐", createdTime: "2024-03-05 10:10", amount: 399, status: "审核中" },
  { id: "10", orderNumber: "ORD-20240301-010", planName: "企业套餐", createdTime: "2024-03-01 09:00", amount: 5000, status: "已通过" },
];

const STATUS_CONFIG: Record<OrderStatus, { color: string; icon: any; bg: string }> = {
  "审核中": { color: "#E87322", icon: Clock, bg: "rgba(232,115,34,0.12)" },
  "已通过": { color: "#22c55e", icon: CheckCircle, bg: "rgba(34,197,94,0.12)" },
  "已驳回": { color: "#ef4444", icon: XCircle, bg: "rgba(239,68,68,0.12)" },
};

const FILTER_TABS = [
  { key: "全部", count: (orders: Order[]) => orders.length },
  { key: "审核中", count: (orders: Order[]) => orders.filter(o => o.status === "审核中").length },
  { key: "已通过", count: (orders: Order[]) => orders.filter(o => o.status === "已通过").length },
  { key: "已驳回", count: (orders: Order[]) => orders.filter(o => o.status === "已驳回").length },
];

const COL = "2fr 2.2fr 1.8fr 1fr 1fr 1fr";

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const statusCfg = STATUS_CONFIG[order.status];
  const StatusIcon = statusCfg.icon;

  const handleSign = () => {
    toast.success("合同签署成功，订单已生效");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-[520px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <FileText size={18} style={{ color: "#E87322" }} />
            <h3 className="text-white">订单详情</h3>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><XCircle size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>订单号</div>
              <div className="text-sm text-white font-mono">{order.orderNumber}</div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: statusCfg.bg }}>
              <StatusIcon size={12} style={{ color: statusCfg.color }} />
              <span className="text-xs" style={{ color: statusCfg.color }}>{order.status}</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { label: "套餐名称", value: order.planName },
              { label: "创建时间", value: order.createdTime },
              { label: "订单金额", value: `¥${order.amount.toLocaleString()}` },
              { label: "订单状态", value: order.status },
            ].map(({ label, value }, idx, arr) => (
              <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                <span className="text-sm text-white">{value}</span>
              </div>
            ))}
          </div>

          {order.status === "审核中" && (
            <button onClick={handleSign} className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white transition-opacity hover:opacity-80" style={{ background: "#E87322" }}>
              <PenTool size={14} />签约
            </button>
          )}

          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>关闭</button>
        </div>
      </div>
    </div>
  );
}

export function OrderManagement() {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState<"全部" | OrderStatus>("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const statusMatch = statusFilter === "全部" || o.status === statusFilter;
    const searchMatch = searchQuery === "" || o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.planName.includes(searchQuery);
    return statusMatch && searchMatch;
  });

  return (
    <div>
      <h3 className="text-white mb-5">订单管理</h3>

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div>
          <div className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>订单状态</div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {FILTER_TABS.map(({ key, count }) => (
              <button key={key} onClick={() => setStatusFilter(key as "全部" | OrderStatus)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  background: statusFilter === key ? STATUS_CONFIG[key as OrderStatus]?.bg || "rgba(255,255,255,0.1)" : "transparent",
                  color: statusFilter === key ? STATUS_CONFIG[key as OrderStatus]?.color || "#fff" : "rgba(255,255,255,0.5)",
                  fontWeight: statusFilter === key ? "500" : "normal",
                }}>
                {key}<span style={{ opacity: 0.5 }}>({count(orders)})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto">
          <div className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>搜索</div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Search size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入订单号或套餐名称" className="bg-transparent outline-none text-sm w-48" style={{ color: "rgba(255,255,255,0.8)" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.color = "white"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.color = "rgba(255,255,255,0.8)"; }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid text-xs px-4 py-3" style={{ gridTemplateColumns: COL, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>套餐名称</div><div>订单号</div><div>创建时间</div><div>金额</div><div>订单状态</div><div>操作</div>
        </div>

        {filtered.length === 0 && <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>暂无订单记录</div>}
        {filtered.map((order, idx) => {
          const statusCfg = STATUS_CONFIG[order.status];
          const StatusIcon = statusCfg.icon;
          return (
            <div key={order.id} className="grid items-center px-4 py-3 text-sm"
              style={{ gridTemplateColumns: COL, background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="text-white">{order.planName}</div>
              <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{order.orderNumber}</div>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>{order.createdTime}</div>
              <div className="text-white">¥{order.amount.toLocaleString()}</div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: statusCfg.bg }}>
                  <StatusIcon size={10} style={{ color: statusCfg.color }} />
                  <span className="text-xs" style={{ color: statusCfg.color }}>{order.status}</span>
                </div>
              </div>
              <div>
                <button onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: "#E87322", background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.2)" }}>
                  <Eye size={11} />查看
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

"use client";

import { mockDashboardMetrics, mockConversionFunnel, mockInsights, mockUsers } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  Cpu,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

function TrendBadge({ value }: { value: number }) {
  const isUp = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        isUp ? "text-emerald-400" : "text-red-400"
      )}
    >
      {isUp ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
}

const insightIcons = {
  warning: AlertTriangle,
  opportunity: Zap,
  suggestion: Lightbulb,
  alert: AlertTriangle,
};

const insightColors = {
  warning: "border-amber-500/20 bg-amber-500/5",
  opportunity: "border-emerald-500/20 bg-emerald-500/5",
  suggestion: "border-primary/20 bg-primary/5",
  alert: "border-red-500/20 bg-red-500/5",
};

const priorityColors = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  low: "text-muted-foreground bg-secondary",
};

export default function DashboardPage() {
  const m = mockDashboardMetrics;
  const funnel = mockConversionFunnel;
  const maxFunnel = funnel.leads;

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
            今日概览
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          实时数据
          <span className="text-muted-foreground/40">·</span>
          更新于 {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-4 gap-4">
        {[
          {
            label: "今日新增用户",
            value: m.newUsersToday.toLocaleString(),
            trend: m.newUsersTrend,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "高意向客户",
            value: m.highIntentCount.toString(),
            trend: m.highIntentTrend,
            icon: Target,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "AI 处理率",
            value: m.aiProcessingRate + "%",
            trend: m.aiProcessingTrend,
            icon: Cpu,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "人工接管率",
            value: m.humanTakeoverRate + "%",
            trend: m.humanTakeoverTrend,
            icon: UserCheck,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <TrendBadge value={stat.trend} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Prediction + Funnel + Insights */}
      <div className="grid grid-cols-3 gap-4">
        {/* Prediction Card */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                今日转化预测
              </h3>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {m.predictedConversions}
              </span>
              <div className="flex flex-col pb-0.5">
                <span className="text-[11px] text-muted-foreground">预计成交</span>
                <TrendBadge value={m.predictedConversionsTrend} />
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-secondary/50 p-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                AI 模型根据历史数据预测，今日有 <span className="font-semibold text-foreground">{m.predictedConversions} 笔</span> 订单可能成交。其中李雪梅（云帆科技）成交概率达 92%。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                转化漏斗
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "线索", value: funnel.leads, pct: 100 },
                { label: "初步咨询", value: funnel.inquiries, pct: (funnel.inquiries / maxFunnel) * 100 },
                { label: "意向确认", value: funnel.intentConfirmed, pct: (funnel.intentConfirmed / maxFunnel) * 100 },
                { label: "已签约", value: funnel.signed, pct: (funnel.signed / maxFunnel) * 100 },
              ].map((stage, idx) => (
                <div key={idx}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{stage.label}</span>
                    <span className="font-mono font-medium text-foreground">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        idx === 0
                          ? "bg-primary"
                          : idx === 1
                          ? "bg-blue-400/70"
                          : idx === 2
                          ? "bg-emerald-400/70"
                          : "bg-emerald-400"
                      )}
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI 销售建议
              </h3>
            </div>
            <ScrollArea className="h-[220px]">
              <div className="space-y-2.5">
                {mockInsights.map((insight) => {
                  const Icon = insightIcons[insight.type];
                  return (
                    <div
                      key={insight.id}
                      className={cn(
                        "rounded-lg border p-3",
                        insightColors[insight.type]
                      )}
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5",
                            insight.type === "warning" || insight.type === "alert"
                              ? "text-amber-400"
                              : insight.type === "opportunity"
                              ? "text-emerald-400"
                              : "text-primary"
                          )}
                        />
                        <span className="text-[12px] font-medium text-foreground">
                          {insight.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("ml-auto text-[10px]", priorityColors[insight.priority])}
                        >
                          {insight.priority === "high" ? "高" : insight.priority === "medium" ? "中" : "低"}
                        </Badge>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { use, useMemo } from "react";
import { mockUserProfiles } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  UserCircle,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Brain,
  Clock,
  ArrowRight,
  MessageSquare,
  MousePointerClick,
  FileText,
  PhoneCall,
  Eye,
  TrendingUp,
} from "lucide-react";
import type { RiskLevel, UserStage, UserIntent, BehaviorEvent } from "@/types";

const riskMap: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "\u4f4e\u98ce\u9669", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  medium: { label: "\u4e2d\u98ce\u9669", color: "text-amber-400", bg: "bg-amber-500/10" },
  high: { label: "\u9ad8\u98ce\u9669", color: "text-orange-400", bg: "bg-orange-500/10" },
  critical: { label: "\u6781\u9ad8\u98ce\u9669", color: "text-red-400", bg: "bg-red-500/10" },
};

const stageMap: Record<UserStage, string> = {
  initial_inquiry: "\u521d\u6b65\u54a8\u8be2",
  comparison: "\u5bf9\u6bd4\u9636\u6bb5",
  closing: "\u5373\u5c06\u6210\u4ea4",
  at_risk: "\u6d41\u5931\u98ce\u9669",
};

const intentMap: Record<UserIntent, string> = {
  price_objection: "\u4ef7\u683c\u5f02\u8bae",
  hesitant: "\u72b9\u8c6b",
  high_intent: "\u9ad8\u610f\u5411",
  watching: "\u89c2\u671b",
  unclear_need: "\u9700\u6c42\u4e0d\u660e\u786e",
};

const behaviorIcons: Record<BehaviorEvent["type"], string> = {
  chat: "MessageSquare",
  visit: "Eye",
  click: "MousePointerClick",
  form: "FileText",
  call: "PhoneCall",
};

const tagColors: Record<string, string> = {
  intent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  behavior: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  demographic: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  risk: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  value: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ProbabilityRing({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    value >= 80
      ? "stroke-emerald-400"
      : value >= 50
      ? "stroke-primary"
      : value >= 30
      ? "stroke-amber-400"
      : "stroke-red-400";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-secondary"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={cn("transition-all duration-1000", color)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-foreground">{value}%</span>
        <span className="text-[9px] text-muted-foreground">\u6210\u4ea4\u6982\u7387</span>
      </div>
    </div>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const profile = useMemo(() => {
    return mockUserProfiles[id] || mockUserProfiles["u1"];
  }, [id]);

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">\u7528\u6237\u4e0d\u5b58\u5728</p>
      </div>
    );
  }

  const risk = riskMap[profile.riskLevel];
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    MessageSquare: MessageSquare,
    Eye: Eye,
    MousePointerClick: MousePointerClick,
    FileText: FileText,
    PhoneCall: PhoneCall,
  };

  return (
    <div className="mx-auto max-w-[960px] p-6">
      <div className="mb-6 flex items-center gap-2">
        <UserCircle className="h-4 w-4 text-primary" />
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
          \u7528\u6237\u753b\u50cf
        </h2>
      </div>

      <Card className="mb-5 border-border bg-card/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-5">
            <Avatar className="h-14 w-14 ring-2 ring-border">
              <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                {profile.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-foreground">{profile.name}</h1>
                <Badge variant="outline" className={cn("text-[11px]", risk.bg, risk.color)}>
                  {risk.label}
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-[11px] text-primary border-primary/20">
                  {stageMap[profile.stage]}
                </Badge>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{profile.company}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{profile.title}</span>
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{profile.industry}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{profile.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.phone}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className={cn("text-[11px]", tagColors[tag.type])}>
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
            <ProbabilityRing value={profile.probability} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI \u7528\u6237\u6d1e\u5bdf</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{profile.aiSummary}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">\u4e92\u52a8\u6570\u636e</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "\u603b\u4e92\u52a8\u6b21\u6570", value: profile.totalInteractions, icon: MessageSquare },
                  { label: "\u5e73\u5747\u54cd\u5e94", value: profile.avgResponseTime, icon: Clock },
                  { label: "\u610f\u5411\u5206\u7c7b", value: intentMap[profile.intent], icon: TrendingUp },
                  { label: "\u6765\u6e90\u6e20\u9053", value: profile.source, icon: Globe },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg bg-secondary/50 p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <stat.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">\u884c\u4e3a\u65f6\u95f4\u7ebf</h3>
              </div>
              <ScrollArea className="h-[240px]">
                <div>
                  {profile.behaviorTimeline.map((event) => {
                    const Icon = iconMap[behaviorIcons[event.type]];
                    return (
                      <div key={event.id} className="flex gap-3 pb-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-3 w-3 text-primary" />
                          </div>
                          <div className="mt-0.5 h-full w-px bg-border" />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-[12px] text-foreground">{event.description}</p>
                          <p className="text-[10px] text-muted-foreground">{event.timestamp.slice(5, 16).replace("T", " ")}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">\u8ddf\u8fdb\u7b56\u7565</h3>
                <Badge variant="outline" className={cn("ml-auto text-[10px]",
                  profile.followStrategy.priority === "urgent"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : profile.followStrategy.priority === "high"
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {profile.followStrategy.priority === "urgent" ? "\u7d27\u6025" : profile.followStrategy.priority === "high" ? "\u9ad8\u4f18\u5148\u7ea7" : profile.followStrategy.priority === "normal" ? "\u5e38\u89c4" : "\u4f4e\u4f18\u5148\u7ea7"}
                </Badge>
              </div>
              <div className="space-y-2.5">
                {profile.followStrategy.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-foreground">{action.action}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground">
                          {action.channel === "phone" ? "\u7535\u8bdd" : action.channel === "wechat" ? "\u5fae\u4fe1" : action.channel === "email" ? "\u90ae\u4ef6" : "\u77ed\u4fe1"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{action.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

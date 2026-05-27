"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, X, Save } from "lucide-react";
import { saveFoodRuleAction, deleteFoodRuleAction } from "@/app/actions/rules";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FoodRule {
  id: string;
  name: string;
  type: "allowed" | "prohibited";
  category: string;
  reason: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  penalty_percent: number | null;
}

export function AdminRulesClient({ initialRules }: { initialRules: FoodRule[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingRule, setEditingRule] = useState<FoodRule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "allowed" | "prohibited">("all");
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"allowed" | "prohibited">("allowed");
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [penaltyPercent, setPenaltyPercent] = useState<number>(10);

  const resetForm = () => {
    setName("");
    setType("allowed");
    setCategory("");
    setReason("");
    setSeverity("medium");
    setPenaltyPercent(10);
    setEditingRule(null);
    setFormError(null);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (rule: FoodRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setType(rule.type);
    setCategory(rule.category);
    setReason(rule.reason || "");
    setSeverity(rule.severity || "medium");
    setPenaltyPercent(rule.penalty_percent ?? 10);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData();
    if (editingRule) {
      formData.append("id", editingRule.id);
    }
    formData.append("name", name);
    formData.append("type", type);
    formData.append("category", category);
    formData.append("reason", reason);
    if (type === "prohibited") {
      formData.append("severity", severity);
      formData.append("penaltyPercent", String(penaltyPercent));
    }

    startTransition(async () => {
      const res = await saveFoodRuleAction({}, formData);
      if (res.error) {
        setFormError(res.error);
      } else {
        setIsFormOpen(false);
        resetForm();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعدة؟")) return;
    
    startTransition(async () => {
      const res = await deleteFoodRuleAction(id);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  // Filter Rules
  const filteredRules = initialRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.reason && rule.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === "all" || rule.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">إدارة المسموحات والممنوعات</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            أضف أو عدّل المأكولات والمشروبات لتحديث محرك الفحص ودليل المستخدمين تلقائياً.
          </p>
        </div>
        <Button onClick={handleOpenAddForm} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2">
          <Plus className="h-4 w-4" />
          قاعدة جديدة
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <input
            type="text"
            placeholder="ابحث عن مادة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-4 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Type */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">كل الأنواع</option>
            <option value="allowed">المسموحات فقط</option>
            <option value="prohibited">الممنوعات فقط</option>
          </select>
        </div>
      </div>

      {/* Form Dialog/Card */}
      {isFormOpen && (
        <Card className="border border-emerald-100 p-6 space-y-4 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingRule ? "تعديل قاعدة غذائية" : "إضافة قاعدة غذائية جديدة"}
            </h2>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {formError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">الاسم / الكلمة المفتاحية</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: جلوتين، أرز، زيت زيتون"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">النوع</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="allowed">مسموح (Allowed)</option>
                  <option value="prohibited">ممنوع (Prohibited)</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">التصنيف</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: نشويات، ألبان، دهون"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Severity & Penalty (Prohibited only) */}
              {type === "prohibited" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">درجة الخطورة</label>
                    <select
                      value={severity}
                      onChange={(e: any) => setSeverity(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="low">منخفضة (Low)</option>
                      <option value="medium">متوسطة (Medium)</option>
                      <option value="high">عالية (High)</option>
                      <option value="critical">حرجة (Critical)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">نسبة الخصم على الالتزام (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={penaltyPercent}
                      onChange={(e) => setPenaltyPercent(Number(e.target.value))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">السبب أو الشرط</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اشرح للمستخدم سبب سماح أو منع هذه المادة..."
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" isLoading={isPending} disabled={isPending}>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rules Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full border-collapse text-right text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-bold">الاسم</th>
              <th className="p-4 font-bold">النوع</th>
              <th className="p-4 font-bold">التصنيف</th>
              <th className="p-4 font-bold">السبب / التفسير</th>
              <th className="p-4 font-bold">الخطورة / الخصم</th>
              <th className="p-4 font-bold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{rule.name}</td>
                <td className="p-4">
                  {rule.type === "allowed" ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle className="h-3.5 w-3.5" />
                      مسموح
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/30">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      ممنوع
                    </span>
                  )}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{rule.category}</td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate" title={rule.reason || ""}>
                  {rule.reason || "-"}
                </td>
                <td className="p-4">
                  {rule.type === "prohibited" ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        خطورة {rule.severity}
                      </span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        خصم {rule.penalty_percent}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" className="px-2" onClick={() => handleOpenEditForm(rule)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950/40 dark:hover:bg-red-950/30" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRules.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                  لا توجد قواعد مطابقة للبحث حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

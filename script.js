import { useState } from "react";
import { useCaffeineItems, useCalculateCaffeine } from "@/hooks/use-caffeine";
import { ItemSelector } from "@/components/ItemSelector";
import { CaffeineMeter } from "@/components/CaffeineMeter";
import { Recommendations } from "@/components/Recommendations";
import { Activity, Coffee, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [step, setStep] = useState<"input" | "results">("input");
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<{ itemId: number; quantity: number }[]>([]);
  
  const { data: items, isLoading: itemsLoading } = useCaffeineItems();
  const { mutate: calculate, isPending, data: result } = useCalculateCaffeine();

  const handleCalculate = () => {
    if (!age || !weight) return;
    calculate(
      { age: parseFloat(age), weight: parseFloat(weight), selectedItems },
      { onSuccess: () => setStep("results") }
    );
  };

  const resetForm = () => {
    setStep("input");
    setSelectedItems([]);
  };

  if (itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-800">카페인 체크</h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-500">
            <span className="text-primary cursor-default">계산기</span>
            <a href="#education" className="hover:text-primary transition-colors">정보</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                  {step === 'input' ? "오늘 카페인 섭취량 확인하기" : "결과가 나왔습니다"}
                </h2>
                <p className="text-slate-500 text-lg">
                  {step === 'input' 
                    ? "나이, 체중, 오늘 섭취한 음식을 입력하세요." 
                    : "추천 섭취량과 비교하여 결과를 확인하세요."}
                </p>
              </div>

              <div className="p-8">
                {step === 'input' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <User size={16} /> 나이 (세)
                        </label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="예: 16"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Activity size={16} /> 체중 (kg)
                        </label>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="예: 55"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-lg"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div>
                      <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                        <Coffee className="text-primary" /> 오늘 무엇을 섭취하셨나요?
                      </h3>
                      <ItemSelector 
                        items={items || []} 
                        selectedItems={selectedItems}
                        onUpdate={setSelectedItems}
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleCalculate}
                        disabled={!age || !weight || selectedItems.length === 0 || isPending}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isPending ? "계산 중..." : "내 카페인 섭취량 계산"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    {result && (
                      <>
                        <CaffeineMeter 
                          current={result.totalIntake} 
                          limit={result.limit} 
                          isOverLimit={result.isOverLimit} 
                        />
                        
                        {result.isOverLimit && (
                          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h4 className="font-bold text-destructive text-lg mb-4">⚠️ 카페인 과다섭취로 인한 문제점</h4>
                            <ul className="space-y-2">
                              {result.problems.map((problem, idx) => (
                                <li key={idx} className="text-sm text-slate-700 font-medium flex items-start gap-3">
                                  <span className="text-destructive text-lg mt-0.5">•</span>
                                  <span>{problem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Recommendations 
                          recommendations={result.recommendations} 
                          isOverLimit={result.isOverLimit}
                        />

                        <button
                          onClick={resetForm}
                          className="w-full py-4 rounded-xl font-bold text-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors mt-8"
                        >
                          다른 날 확인하기
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6" id="education">
            <div className="bg-secondary/10 rounded-3xl p-6 border border-secondary/20">
              <h3 className="text-xl font-display font-bold text-secondary-foreground mb-3 text-secondary">
                알고 계셨나요?
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                청소년들은 어른보다 카페인에 더 민감합니다. 뇌가 아직 발달 중이므로 과도한 카페인 섭취는 성장과 학습에 필수적인 수면을 방해할 수 있습니다.
              </p>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">추천 섭취량</span>
                <span className="text-2xl font-bold text-secondary">2.5 mg</span>
                <span className="text-slate-500 font-medium"> / 체중 1kg당</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4">주요 카페인 원천</h3>
              <ul className="space-y-3">
                {[
                  { name: "에너지 음료", amount: "80-150mg" },
                  { name: "커피", amount: "95mg" },
                  { name: "탄산음료", amount: "35-55mg" },
                  { name: "다크 초콜릿", amount: "12mg" },
                ].map(item => (
                  <li key={item.name} className="flex justify-between items-center text-sm font-medium p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
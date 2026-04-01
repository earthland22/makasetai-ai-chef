"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2, ChefHat, UtensilsCrossed, AlertCircle, Settings, Trash2, ChevronDown, ChevronUp } from "lucide-react";

// --- データ ---
const 材料一覧 = [
{ カテゴリ: "🥩肉類", 商品: ["鶏むね肉", "鶏もも肉", "豚こま切れ", "挽き肉", "ベーコン", "ウインナー"] },
{ カテゴリ: "🐟魚介類", 商品: ["鮭", "さば缶", "ツナ缶", "えび", "あさり", "しらす"] },
{ カテゴリ: "🥚卵・乳製品", 商品: ["卵", "牛乳", "豆腐", "納豆", "チーズ", "バター"] },
{ カテゴリ: "🥦野菜", 商品: ["キャベツ", "玉ねぎ", "にんじん", "じゃがいも", "もやし", "ほうれん草", "小松菜", "ブロッコリー", "なす", "ピーマン", "大根"] },
{ カテゴリ: "🍄きのこ・その他", 商品: ["しめじ", "えのき", "エリンギ", "椎茸", "こんにゃく", "キムチ"] },
{ カテゴリ: "❄️冷凍食材", 商品: ["冷凍枝豆", "冷凍コーン", "冷凍ほうれん草", "冷凍ミックスベジタブル"] },
{ カテゴリ: "🧂調味料・缶詰", 商品: ["トマト缶", "コンソメ", "めんつゆ", "味噌", "醤油", "ポン酢", "カレー粉"] },
];

const 調査順 = [
{
家族: "👨‍👩‍👧‍👦",
タイトル: "家族構成を教えてください",
オプション: ["一人暮らし", "夫婦2人", "未就学児がいる", "小中学生がいる", "食べ盛りがいる", "高齢者がいる"]
},
{
アレルギー: "⚠️",
タイトル: "アレルギー・食べられないものはありますか？",
オプション: ["卵", "乳製品", "小麦", "そば", "えび・かに", "ナッツ類", "特になし"]
},
];

// --- メインコンポーネント ---
export default function KitchenApp() {
const [selectedIngredients, setSelectedIngredients] = useState([]);
const [selections, setSelections] = useState({ 家族構成: "", アレルギー: [] });
const [recipe, setRecipe] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// レシピ生成関数
const generateRecipe = async () => {
if (selectedIngredients.length === 0) {
setError("食材を1つ以上選んでください");
return;
}

setLoading(true);
setError(null);

try {
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
あなたはプロの料理研究家です。以下の条件で、家庭で簡単に作れる美味しいレシピを1つ提案してください。 

【選んだ食材】: ${selectedIngredients.join(", ")}
【家族構成】: ${selections.家族構成}
【配慮事項】: ${selections.アレルギー.join(", ")}

回答は必ず以下の形式（JSON）で出力してください。余計な説明は不要です。
{
"title": "料理名",
"description": "料理の簡単な紹介",
"ingredients": ["材料1", "材料2"],
"steps": ["工程1", "工程2"],
"tips": "美味しく作るコツ"
}
`;

const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();

// JSONをパース（余計な装飾を除去）
const cleanJson = text.replace(/```json|```/g, "").trim();
setRecipe(JSON.parse(cleanJson));
} catch (err) {
console.error(err);
setError("レシピの生成に失敗しました。時間をおいて再度お試しください。");
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans">
<header className="max-w-2xl mx-auto mb-8 text-center">
<div className="flex justify-center mb-2">
<ChefHat size={40} className="text-blue-400" />
</div>
<h1 className="text-2xl font-bold">まかせて！AIシェフ</h1>
<p className="text-slate-400 text-sm">食材を伝えるだけで今日の献立を提案</p>
</header>

<main className="max-w-2xl mx-auto space-y-6">
{/* 食材選択エリア */}
<section className="bg-slate-800 rounded-xl p-4 shadow-lg">
<h2 className="flex items-center gap-2 font-bold mb-4">
<UtensilsCrossed size={20} /> 今ある食材を選ぶ
</h2>
<div className="space-y-4">
{材料一覧.map((cat) => (
<div key={cat.カテゴリ}>
<p className="text-xs text-slate-400 mb-2">{cat.カテゴリ}</p>
<div className="flex flex-wrap gap-2">
{cat.商品.map((item) => (
<button
key={item}
onClick={() => {
setSelectedIngredients(prev =>
prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
);
}}
className={`px-3 py-1.5 rounded-full text-sm transition-all ${
selectedIngredients.includes(item)
? "bg-blue-600 text-white shadow-md scale-105"
: "bg-slate-700 text-slate-300 hover:bg-slate-600"
}`}
>
{item}
</button>
))}
</div>
</div>
))}
</div>
</section>

{/* 生成ボタン */}
<button
onClick={generateRecipe}
disabled={loading}
className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
>
{loading ? (
<>
<Loader2 className="animate-spin" /> シェフが考えています...
</>
) : (
"レシピを生成する"
)}
</button>

{/* エラー表示 */}
{error && (
<div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
<AlertCircle className="text-red-500 shrink-0" />
<div>
<p className="text-red-200 font-bold">エラーが発生しました</p>
<p className="text-red-300/80 text-sm">{error}</p>
</div>
</div>
)}

{/* 結果表示 */}
{recipe && (
<article className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
<div className="bg-blue-600 p-6 text-white">
<h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
<p className="opacity-90 italic text-sm">{recipe.description}</p>
</div>
<div className="p-6 space-y-6">
<div>
<h3 className="font-bold border-l-4 border-blue-500 pl-2 mb-3">材料</h3>
<ul className="grid grid-cols-2 gap-2 text-sm">
{recipe.ingredients.map((ing, i) => (
<li key={i} className="bg-slate-100 p-2 rounded">・ {ing}</li>
))}
</ul>
</div>
<div>
<h3 className="font-bold border-l-4 border-blue-500 pl-2 mb-3">作り方</h3>
<ol className="space-y-3">
{recipe.steps.map((step, i) => (
<li key={i} className="flex gap-3 text-sm">
<span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold">
{i + 1}
</span>
<p>{step}</p>
</li>
))}
</ol>
</div>
<div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
<p className="text-yellow-800 text-xs font-bold mb-1">💡 シェフのアドバイス</p>
<p className="text-yellow-900 text-sm">{recipe.tips}</p>
</div>
</div>
</article>
)}
</main>
<footer className="text-center mt-12 pb-8 text-slate-500 text-xs">
© 2026 Earth's Land - Makasetai AI Chef
</footer>
</div>
);
}

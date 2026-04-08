"use client";
import { useState } from "react";
import { Loader2, ChefHat, UtensilsCrossed } from "lucide-react";

const 材料一覧 = [
{ カテゴリ: "🥩肉類", 商品: ["鶏むね肉", "鶏もも肉", "豚バラ肉", "豚こま肉", "牛こま肉", "ひき肉"] },
{ カテゴリ: "🐟魚介類", 商品: ["鮭", "さば缶", "ツナ缶", "えび", "あさり"] },
{ カテゴリ: "🥚卵・乳製品", 商品: ["卵", "牛乳", "チーズ", "バター", "ヨーグルト"] },
{ カテゴリ: "🥦野菜", 商品: ["キャベツ", "玉ねぎ", "人参", "じゃがいも", "ピーマン", "なす", "ほうれん草"] },
{ カテゴリ: "🍄きのこ・その他", 商品: ["しめじ", "えのき", "豆腐", "納豆", "キムチ"] },
];
export default function KitchenApp() {
const [selectedIngredients, setSelectedIngredients] = useState([]);
const [recipe, setRecipe] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const toggleIngredient = (item) => {
setSelectedIngredients(prev =>
prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
);
};

const generateRecipe = async () => {
if (selectedIngredients.length === 0) {
setError("食材を1つ以上選んでください");
return;
}
setLoading(true);
setError(null);
try {
const response = await fetch("/api/recipe", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
ingredients: selectedIngredients,
conditions: "家庭で簡単に作れる美味しいレシピ"
}),
});
if (!response.ok) throw new Error("生成に失敗しました");
const data = await response.json();
setRecipe(data);
} catch (err) {
setError("レシピの生成中にエラーが発生しました");
} finally {
setLoading(false);
}
};
return (
<div className="max-w-4xl mx-auto p-6 space-y-8 bg-orange-50 min-h-screen">
<div className="text-center space-y-2">
<h1 className="text-4xl font-bold text-orange-600 flex items-center justify-center gap-2">
<ChefHat size={40} /> まかせて！AIシェフ
</h1>
<p className="text-gray-600">冷蔵庫にあるものを選んで、AIに献立を相談しよう！</p>
</div>
<div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-orange-100">
<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
<UtensilsCrossed className="text-orange-500" /> 食材を選ぶ
</h2>
<div className="space-y-6">
{材料一覧.map((cat) => (
<div key={cat.カテゴリ}>
<h3 className="text-sm font-medium text-gray-500 mb-2">{cat.カテゴリ}</h3>
<div className="flex flex-wrap gap-2">
{cat.商品.map((item) => (
<button
key={item}
onClick={() => toggleIngredient(item)}
className={px-4 py-2 rounded-full border-2 transition-all ${                       selectedIngredients.includes(item)                         ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"                         : "bg-white border-gray-200 text-gray-700 hover:border-orange-300"                     }}
>
{item}
</button>
))}
</div>
</div>
))}
</div>
<button
onClick={generateRecipe}
disabled={loading || selectedIngredients.length === 0}
className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transition-colors"
>
{loading ? <Loader2 className="animate-spin" /> : "この食材でレシピを作る！"}
</button>
</div>
{error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-r shadow">{error}</div>}
{recipe && (
<div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-orange-200">
<h2 className="text-3xl font-bold text-orange-700 mb-6 border-b-4 border-orange-100 pb-2">✨ {recipe.title}</h2>
<div className="grid md:grid-cols-2 gap-8">
<div>
<h3 className="font-bold text-lg mb-3 text-orange-600">🍳 材料</h3>
<ul className="list-disc list-inside space-y-2 text-gray-700 bg-orange-50 p-4 rounded-xl">
{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
</ul>
</div>
<div>
<h3 className="font-bold text-lg mb-3 text-orange-600">📝 作り方</h3>
<ol className="list-decimal list-inside space-y-3 text-gray-700">
{recipe.steps.map((step, i) => <li key={i} className="border-b border-gray-100 pb-2">{step}</li>)}
</ol>
</div>
</div>
</div>
)}
</div>
);
}
 

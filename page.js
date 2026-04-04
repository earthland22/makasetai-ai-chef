何も選択されていません 

コンテンツへ
Gmail でのスクリーン リーダーの使用
4 / 169
①
受信トレイ

篠原千恵
1:19 (14 分前)
To 自分

"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2, ChefHat, UtensilsCrossed, AlertCircle } from "lucide-react";

const 材料一覧 = [
{ カテゴリ: "🥩肉類", 商品: ["鶏むね肉", "鶏もも肉", "豚こま切れ", "挽き肉", "ベーコン", "ウインナー"] },
{ カテゴリ: "🐟魚介類", 商品: ["鮭", "さば缶", "ツナ缶", "えび", "あさり", "しらす"] },
{ カテゴリ: "🥚卵・乳製品", 商品: ["卵", "牛乳", "豆腐", "納豆", "チーズ", "バター"] },
{ カテゴリ: "🥦野菜", 商品: ["キャベツ", "玉ねぎ", "にんじん", "じゃがいも", "もやし", "ほうれん草", "小松菜", "ブロッコリー", "なす", "ピーマン", "大根"] },
{ カテゴリ: "🍄きのこ・その他", 商品: ["しめじ", "えのき", "エリンギ", "椎茸", "こんにゃく", "キムチ"] },
];

画像

新しい会話

あなた専属のAIアーティストが準備完了です🎨 例えば、🐦海の上を飛ぶ鳥、🏝️島のヤシの木、🏡雪山の中の家など、あなたが作りたいものを教えてください。数秒でユニークな作品をお作りします。

bot artist image
例：ビーチで走る甘い子犬

Dall-e 3

10
アップグレード



im
選択範囲を貼り付け
たとえば
⛵️ 海の中の船
👩 都市の女性


レビューを書いてクレジットを獲得しましょう ❤
チャット
尋ねる
検索
書く
画像
チャットファイル
ビジョン
代理人
全ページ
招待して稼ぐ
export default function KitchenApp() {
const [selectedIngredients, setSelectedIngredients] = useState([]);
const [recipe, setRecipe] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const generateRecipe = async () => {
if (selectedIngredients.length === 0) {
setError("食材を1つ以上選んでください");
return;
}
setLoading(true);
setError(null);
try {
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const prompt = `${selectedIngredients.join(", ")}を使ったレシピを1つ、JSON形式で教えて。 { "title": "", "description": "", "ingredients": [], "steps": [], "tips": "" }`;
const result = await model.generateContent(prompt);
const text = await result.response.text();
const i = text.index0f("{");
const j = text.lastIndex0f("}");
setRecipe(JSON.parse(text.slice(i,j+1)));
} catch (err) {
setError("エラーが発生しました");
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen bg-slate-900 text-slate-100 p-4">
<header className="max-w-2xl mx-auto mb-8 text-center">
<ChefHat size={40} className="mx-auto mb-2 text-blue-400" />
<h1 className="text-2xl font-bold">まかせて！AIシェフ</h1>
</header>
<main className="max-w-2xl mx-auto space-y-6">
<section className="bg-slate-800 rounded-xl p-4">
<h2 className="flex items-center gap-2 font-bold mb-4"><UtensilsCrossed size={20} /> 食材を選ぶ</h2>
{材料一覧.map((cat) => (
<div key={cat.カテゴリ} className="mb-4">
<p className="text-xs text-slate-400 mb-2">{cat.カテゴリ}</p>
<div className="flex flex-wrap gap-2">
{cat.商品.map((item) => (
<button key={item} onClick={() => setSelectedIngredients(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
className={`px-3 py-1.5 rounded-full text-sm ${selectedIngredients.includes(item) ? "bg-blue-600" : "bg-slate-700"}`}>{item}</button>
))}
</div>
</div>
))}
</section>

<button onClick={generateRecipe} disabled={loading} className="w-full bg-blue-500 py-4 rounded-xl font-bold">
{loading ? <Loader2 className="animate-spin mx-auto" /> : "レシピを生成する"}
</button>
{recipe && (
<article className="bg-white text-slate-900 rounded-2xl p-6 mt-6">
<h2 className="text-2xl font-bold text-blue-600">{recipe.title}</h2>
<p className="my-4">{recipe.description}</p>
<h3 className="font-bold border-l-4 border-blue-500 pl-2 mb-2">材料</h3>
<ul className="list-disc pl-5 mb-4">{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
<h3 className="font-bold border-l-4 border-blue-500 pl-2 mb-2">作り方</h3>
<ol className="list-decimal pl-5">{recipe.steps.map((step, i) => <li key={i} className="mb-2">{step}</li>)}</ol>
</article>
)}
</main>
</div>
);
}


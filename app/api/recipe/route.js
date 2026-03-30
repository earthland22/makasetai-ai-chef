import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(req) {
try {
const { ingredients } = await req.json();
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `あなたはプロの料理シェフです。
以下の食材を使って、家庭で簡単に作れる美味しいレシピを1つ提案してください。
食材: ${ingredients}

回答は必ず以下の形式で返してください：
【料理名】
（料理の名前）

【材料】
（材料のリスト）

【作り方】
（手順を箇条書きで）

【シェフの一言】
（美味しく作るコツなど）`;

const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();

return NextResponse.json({ recipe: text });
} catch (error) {
console.error(error);
return NextResponse.json({ error: "レシピの生成に失敗しました" }, { status: 500 });
}
}


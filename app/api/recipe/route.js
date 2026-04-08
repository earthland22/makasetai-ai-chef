import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
try {
const { ingredients, conditions } = await req.json();
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

```
const prompt = `
  以下の食材と条件で料理レシピを1つ提案してください。
  食材: ${ingredients}
  条件: ${conditions}
  必ず以下のJSON形式で返してください。余計な説明は不要です。
  { "title": "料理名", "ingredients": ["材料1", "材料2"], "steps": ["工程1", "工程2"] }
`;

const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();

// JSON部分だけを抽出する処理
const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
if (!jsonMatch) throw new Error("JSON not found");
const data = JSON.parse(jsonMatch[0]);

return NextResponse.json(data);
```

} catch (error) {
console.error("Error:", error);
return NextResponse.json({ error: "レシピ生成に失敗しました" }, { status: 500 });
}
}

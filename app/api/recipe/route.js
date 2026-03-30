import { NextResponse } from 'next/server'

// ✅ APIキーはサーバーサイドのみ。ブラウザには一切露出しない。
export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 })
  }

  const body = await req.json()
  const { ingredients, cuisineType, mealType, profile, imageBase64 } = body

  // プロフィールをテキスト化
  const lines = []
  if (profile?.family?.length) lines.push(`家族構成：${profile.family.join('、')}`)
  if (profile?.allergy?.filter(a => a !== '特にない').length)
    lines.push(`アレルギー除去：${profile.allergy.filter(a => a !== '特にない').join('、')}`)
  if (profile?.health?.filter(h => h !== '特になし').length)
    lines.push(`健康目標：${profile.health.filter(h => h !== '特になし').join('、')}`)
  if (profile?.dislike) lines.push(`苦手食材：${profile.dislike}`)
  if (profile?.priority) lines.push(`優先事項：${profile.priority}`)
  const profileHint = lines.length ? `\n【ユーザー情報】\n${lines.join('\n')}` : ''

  const healthGoals = profile?.health?.filter(h => h !== '特になし') || []

  const nutritionGuide = healthGoals.length > 0
    ? `nutrition_tipには「${healthGoals.join('、')}」の健康目標に沿ったアドバイスを書いてください。
その食材が目標に合わない場合は「XXを加えると${healthGoals[0]}に効果的」「XXをYYに変えると${healthGoals[0]}を助ける」など具体的に提案してください。`
    : `nutrition_tipには食材の置き換えアドバイスを1〜2文で書いてください（例：豚バラ→鶏むね肉にすると脂質が減ります）。`

  const shortcutGuide = cuisineType
    ? `shortcut_tipは、${cuisineType}より他のジャンルの方が明らかに時短・コスパが良い場合のみ「${cuisineType}もいいですが、今日の食材なら中華の炒め物なら5分で完成します！」のような一言を入れてください。そうでなければ空文字にしてください。`
    : `shortcut_tipは空文字にしてください。`

  const cuisineHint = cuisineType ? `希望ジャンル：${cuisineType}` : ''
  const mealHint = mealType ? `メイン食材系：${mealType}` : ''

  // ── systemプロンプト：JSON以外は1文字も出力しないよう厳格指定 ──
  const systemMsg = `あなたは主婦向け献立提案AIです。以下のルールを必ず守ってください。

【絶対ルール】
- 返答はJSONオブジェクト1つだけ
- 挨拶・説明・コメント・マークダウン・バッククォート（\`\`\`）は一切禁止
- 最初の文字は必ず { 、最後の文字は必ず } にすること

出力するJSONの構造（このフォーマット通りに出力）:
{"shortcut_tip":"","ingredients_found":["食材A","食材B"],"meals":[{"title":"朝食の料理名","description":"一言説明","nutrition_tip":"アドバイス","ingredients":["食材"],"time":"5分","cost":"¥150"},{"title":"昼食の料理名","description":"一言説明","nutrition_tip":"アドバイス","ingredients":["食材"],"time":"10分","cost":"¥200"},{"title":"夕食の料理名","description":"一言説明","nutrition_tip":"アドバイス","ingredients":["食材"],"time":"15分","cost":"¥300"}]}

条件：時短・コスパ重視・主婦向け・必ず朝昼夕3食分
${[cuisineHint, mealHint].filter(Boolean).join('\n')}
${profileHint}
${nutritionGuide}
${shortcutGuide}`

  // メッセージ構築
  let userContent
  if (imageBase64) {
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
      { type: 'text', text: '冷蔵庫の写真から食材を読み取り、3食の献立をJSONで返してください。' },
    ]
  } else {
    const ingText = Array.isArray(ingredients) ? ingredients.join('、') : ''
    userContent = `食材：${ingText}\nこの食材を使って3食の献立をJSONで返してください。`
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,                    // ✅ process.env から読み込み
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemMsg,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: `Anthropic APIエラー: ${data?.error?.message || res.status}` },
        { status: res.status }
      )
    }

    const rawText = (data.content ?? [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('')

    // { } の範囲でJSONを確実に抽出
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return NextResponse.json(
        { error: 'JSON抽出失敗', raw: rawText.slice(0, 300) },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(rawText.slice(start, end + 1))

    if (!Array.isArray(parsed.meals) || parsed.meals.length < 3) {
      return NextResponse.json(
        { error: '3食分のデータが不足しています', raw: rawText.slice(0, 300) },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ error: `サーバーエラー: ${e.message}` }, { status: 500 })
  }
}

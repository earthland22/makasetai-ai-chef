import { NextResponse } from 'next/server'

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY  // ✅ process.env から読み込み
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 })
  }

  const { messages, profile, ingredients } = await req.json()

  const profileLines = []
  if (profile?.family?.length) profileLines.push(`家族：${profile.family.join('、')}`)
  if (profile?.health?.filter(h => h !== '特になし').length)
    profileLines.push(`健康目標：${profile.health.filter(h => h !== '特になし').join('、')}`)
  if (profile?.priority) profileLines.push(`優先：${profile.priority}`)

  const systemMsg = `あなたは主婦の料理をサポートするAIアシスタント「AIシェフ」です。
明るく親しみやすい口調で、絵文字を適度に使います。3〜5文で簡潔に答えます。
以下のアドバイスを状況に応じて提供してください：
・カサ増し・節約アイデア（もやし・豆苗・こんにゃくなど）
・食材の豆知識（例：豆苗は根を水に浸けると2〜3回再利用できる）
・驚きの組み合わせアイデア（例：納豆＋キムチ＋卵で免疫アップ丼）
・栄養・健康アドバイス（プロフィールの健康目標に合わせて）
・時短テクニック（電子レンジ活用・まとめ調理など）
${profileLines.length ? `ユーザー情報：${profileLines.join(' / ')}` : ''}
${ingredients ? `現在の食材：${ingredients}` : ''}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: systemMsg,
      messages,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data?.error?.message || 'APIエラー' }, { status: res.status })
  }

  const text = (data.content ?? [])
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('')

  return NextResponse.json({ text })
}

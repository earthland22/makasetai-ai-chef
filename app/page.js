'use client'
import { useState, useRef, useEffect } from 'react'

// ─────────────────────────────────────────────
// 静的データ
// ─────────────────────────────────────────────
const INGREDIENT_SHEET = [
  { category:'🥩 肉類', items:['鶏むね肉','鶏もも肉','豚こま切れ','豚バラ','牛こま切れ','ひき肉','ベーコン','ソーセージ'] },
  { category:'🐟 魚介類', items:['鮭','さば缶','ツナ缶','えび','ちくわ','かまぼこ','はんぺん','しらす'] },
  { category:'🥚 卵・乳製品', items:['卵','牛乳','豆腐','納豆','チーズ','バター','ヨーグルト'] },
  { category:'🥦 野菜', items:['キャベツ','玉ねぎ','にんじん','じゃがいも','大根','ほうれん草','小松菜','ブロッコリー','トマト','きゅうり','なす','ピーマン','もやし','長ねぎ','豆苗'] },
  { category:'🍄 きのこ・その他', items:['しめじ','えのき','エリンギ','わかめ','こんにゃく','油揚げ','厚揚げ'] },
  { category:'❄️ 冷凍食材', items:['冷凍枝豆','冷凍コーン','冷凍ほうれん草','冷凍うどん','冷凍餃子','冷凍ご飯'] },
  { category:'🧂 調味料・缶詰', items:['トマト缶','コンソメ','めんつゆ','ポン酢','味噌','醤油','みりん','ごま油'] },
]
const SURVEY_STEPS = [
  { id:'family', emoji:'👨‍👩‍👧‍👦', title:'家族構成を教えてください', sub:'献立の量や栄養バランスに反映します', type:'multi',
    options:['一人暮らし','夫婦2人','未就学児がいる','小中学生がいる','高校生・大学生がいる','高齢者（60代以上）がいる','妊娠中・授乳中'] },
  { id:'allergy', emoji:'⚠️', title:'アレルギー・食べられないものは？', sub:'該当するものをすべて選んでください', type:'multi',
    options:['卵','乳製品','小麦','そば','えび・かに','ナッツ類','魚介類全般','豚肉','牛肉','特にない'] },
  { id:'health', emoji:'💪', title:'健康面で気をつけていることは？', sub:'栄養アドバイスに活用します', type:'multi',
    options:['塩分を控えたい','糖質を控えたい','脂質を控えたい','カルシウムを増やしたい','鉄分を増やしたい','たんぱく質を多く摂りたい','コラーゲンを意識したい','免疫力を上げたい','特になし'] },
  { id:'dislike', emoji:'🙅', title:'苦手な食材は？', sub:'自由に入力（なければ空欄でOK）', type:'text', placeholder:'例：レバー、セロリ、パクチー…' },
  { id:'priority', emoji:'⭐', title:'料理で一番大切にしていることは？', sub:'献立提案の方向性を決めます', type:'single',
    options:['⏱ とにかく時短','💰 コスパ重視','🥗 栄養バランス重視','😋 家族が喜ぶ味重視','🌿 ヘルシー・カロリー控えめ'] },
]
const CUISINE_OPTIONS = [
  { key:'🍱 和食', sub:'煮物・味噌汁・焼き魚など' },
  { key:'🍝 洋食', sub:'炒め物・スープ・パスタなど' },
  { key:'🥢 中華', sub:'炒め物・チャーハン・スープ' },
  { key:'🌶️ エスニック', sub:'アジア風・スパイシー' },
  { key:'🤷 なんでもOK', sub:'AIにおまかせ' },
]
const MEAL_TYPE_OPTIONS = ['🥩 肉料理','🐟 魚料理','🥗 野菜中心','🍜 麺・丼もの','💰 節約重視']
const ADVICE_TYPES = [
  { emoji:'💰', label:'カサ増し・節約' },
  { emoji:'♻️', label:'食材の豆知識' },
  { emoji:'✨', label:'驚きの組み合わせ' },
  { emoji:'🥗', label:'栄養・健康' },
  { emoji:'⏱', label:'時短テクニック' },
]

// ─────────────────────────────────────────────
// ユーティリティ
// ─────────────────────────────────────────────
function getDaysLeft(start) {
  return Math.max(0, 7 - Math.floor((Date.now() - start) / 86400000))
}

// ─────────────────────────────────────────────
// 小コンポーネント
// ─────────────────────────────────────────────
function Tag({ label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ padding:'8px 14px', borderRadius:'20px', cursor:'pointer',
      background:active?'#63b3ed':'rgba(255,255,255,0.07)',
      color:active?'#0a1628':'rgba(255,255,255,0.75)',
      border:active?'none':'1px solid rgba(255,255,255,0.15)',
      fontSize:'13px', fontWeight:active?700:400, transition:'all 0.15s', userSelect:'none' }}>
      {active?'✓ ':''}{label}
    </div>
  )
}

function PrimaryBtn({ active=true, onClick, children }) {
  return (
    <button onClick={onClick} disabled={!active} style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none',
      background:active?'linear-gradient(135deg,#2b6cb0,#63b3ed)':'rgba(255,255,255,0.1)',
      color:active?'#fff':'rgba(255,255,255,0.3)', fontSize:'15px',
      fontFamily:"'Noto Serif JP',serif", fontWeight:700,
      cursor:active?'pointer':'not-allowed',
      boxShadow:active?'0 6px 20px rgba(99,179,237,0.35)':'none',
      transition:'all 0.3s', letterSpacing:'0.04em' }}>
      {children}
    </button>
  )
}

function BackBar({ onBack, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
      <button onClick={onBack} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'10px', color:'rgba(255,255,255,0.6)', fontSize:'13px', padding:'6px 12px', cursor:'pointer' }}>← 戻る</button>
      <span style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'14px', color:'#fff' }}>{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// AIシェフ インラインチャット（献立の下に表示）
// ─────────────────────────────────────────────
function InlineChat({ profile, ingredients }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'食材についてのアドバイスをするよ😊 もやし・豆苗などの節約食材の使い方、栄養のこと、時短ワザなど何でも聞いて！' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async (overrideInput) => {
    const userMsg = (overrideInput || input).trim()
    if (!userMsg || loading) return
    setInput('')
    const newMsgs = [...messages, { role:'user', content:userMsg }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      // ✅ /api/chat 経由でサーバーサイドに送る（APIキーはブラウザに露出しない）
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role:m.role, content:m.content })),
          profile,
          ingredients
        })
      })
      const data = await res.json()
      setMessages(m => [...m, { role:'assistant', content: data.text || 'うまく答えられませんでした😅' }])
    } catch {
      setMessages(m => [...m, { role:'assistant', content:'通信エラーが発生しました。' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(99,179,237,0.25)', borderRadius:'18px', overflow:'hidden', marginBottom:'16px' }}>
      <div style={{ padding:'12px 16px 8px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontSize:'22px' }}>👩‍🍳</span>
        <div>
          <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'13px', color:'#fff' }}>AIシェフに相談する</div>
          <div style={{ fontSize:'10px', color:'#63b3ed' }}>食材・時短・栄養・節約アドバイス</div>
        </div>
      </div>
      <div style={{ maxHeight:'260px', overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:'7px', alignItems:'flex-start' }}>
            {m.role==='assistant' && <div style={{ fontSize:'20px', flexShrink:0, marginTop:'2px' }}>👩‍🍳</div>}
            <div style={{ maxWidth:'85%', padding:'10px 14px',
              borderRadius:m.role==='user'?'16px 16px 4px 16px':'4px 16px 16px 16px',
              background:m.role==='user'?'linear-gradient(135deg,#2b6cb0,#4299e1)':'rgba(255,255,255,0.09)',
              color:'#fff', fontSize:'13px', lineHeight:'1.7' }}>
              {m.content}
            </div>
            {m.role==='user' && <div style={{ fontSize:'20px', flexShrink:0, marginTop:'2px' }}>🙋‍♀️</div>}
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'7px' }}>
            <div style={{ fontSize:'20px' }}>👩‍🍳</div>
            <div style={{ padding:'10px 14px', borderRadius:'4px 16px 16px 16px', background:'rgba(255,255,255,0.09)', display:'flex', gap:'4px', alignItems:'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#63b3ed', animation:`pulse 1s ease ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding:'6px 12px', display:'flex', gap:'6px', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        {ADVICE_TYPES.map(a => (
          <div key={a.label} onClick={() => send(`${a.label}について教えて`)}
            style={{ fontSize:'11px', background:'rgba(99,179,237,0.12)', color:'#90cdf4', borderRadius:'12px', padding:'4px 10px', cursor:'pointer', border:'1px solid rgba(99,179,237,0.2)' }}>
            {a.emoji} {a.label}
          </div>
        ))}
      </div>
      <div style={{ padding:'8px 12px 12px', display:'flex', gap:'8px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()}
          placeholder='例：豆苗って何回使えるの？'
          style={{ flex:1, padding:'10px 14px', borderRadius:'20px', border:'1px solid rgba(99,179,237,0.3)', background:'rgba(0,0,0,0.25)', color:'#fff', fontSize:'12px', outline:'none', fontFamily:"'Noto Sans JP',sans-serif" }} />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          style={{ width:'40px', height:'40px', borderRadius:'50%', border:'none',
            background:input.trim()?'#63b3ed':'rgba(255,255,255,0.1)',
            color:input.trim()?'#0a1628':'rgba(255,255,255,0.3)', fontSize:'16px',
            cursor:input.trim()?'pointer':'default', flexShrink:0 }}>➤</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// アンケート画面
// ─────────────────────────────────────────────
function SurveyScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const cur = SURVEY_STEPS[step]
  const isLast = step === SURVEY_STEPS.length - 1
  const toggle = v => { const p = answers[cur.id] || []; setAnswers(a => ({...a, [cur.id]: p.includes(v) ? p.filter(x => x!==v) : [...p, v]})) }
  const setSingle = v => setAnswers(a => ({...a, [cur.id]: v}))
  const canNext = () => cur.type==='text' ? true : cur.type==='single' ? !!answers[cur.id] : (answers[cur.id]||[]).length > 0
  const progress = ((step+1) / SURVEY_STEPS.length) * 100

  return (
    <div style={{ padding:'0 16px' }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px' }}>STEP {step+1} / {SURVEY_STEPS.length}</span>
          <span style={{ color:'#63b3ed', fontSize:'12px', fontWeight:600 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'4px', height:'4px' }}>
          <div style={{ background:'linear-gradient(90deg,#2b6cb0,#63b3ed)', borderRadius:'4px', height:'4px', width:`${progress}%`, transition:'width 0.4s ease' }} />
        </div>
      </div>
      <div style={{ textAlign:'center', marginBottom:'22px' }}>
        <div style={{ fontSize:'44px', marginBottom:'10px' }}>{cur.emoji}</div>
        <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:900, fontSize:'18px', color:'#fff', marginBottom:'6px', lineHeight:'1.4' }}>{cur.title}</div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{cur.sub}</div>
      </div>
      <div style={{ marginBottom:'24px' }}>
        {cur.type==='text' ? (
          <textarea value={answers[cur.id]||''} onChange={e => setAnswers(a => ({...a, [cur.id]: e.target.value}))}
            placeholder={cur.placeholder || ''} rows={4}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'1.5px solid rgba(99,179,237,0.3)', background:'rgba(0,0,0,0.2)', color:'#fff', fontSize:'13px', fontFamily:"'Noto Sans JP',sans-serif", resize:'none', outline:'none', boxSizing:'border-box', lineHeight:'1.7' }} />
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center' }}>
            {cur.options.map(o => {
              const active = cur.type==='single' ? answers[cur.id]===o : (answers[cur.id]||[]).includes(o)
              return <Tag key={o} label={o} active={active} onClick={() => cur.type==='single' ? setSingle(o) : toggle(o)} />
            })}
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:'10px' }}>
        {step > 0 && <button onClick={() => setStep(s => s-1)} style={{ flex:'0 0 72px', padding:'14px', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:'13px', cursor:'pointer' }}>← 戻る</button>}
        <div style={{ flex:1 }}>
          <PrimaryBtn active={canNext()} onClick={() => isLast ? onComplete(answers) : setStep(s => s+1)}>
            {isLast ? '✨ 設定を保存して無料体験を始める' : '次へ →'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// メインアプリ
// ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [profile, setProfile] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [trialStart] = useState(Date.now())
  const [chatMode, setChatMode] = useState('B')
  const [inputMode, setInputMode] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef(null)
  const [checked, setChecked] = useState({})
  const [freeText, setFreeText] = useState('')
  const [openCat, setOpenCat] = useState(null)
  const [cuisineType, setCuisineType] = useState(null)
  const [mealType, setMealType] = useState(null)
  const [mealTypeStep, setMealTypeStep] = useState(false)
  const [meals, setMeals] = useState(null)
  const [error, setError] = useState('')

  const daysLeft = getDaysLeft(trialStart)
  const checkedItems = Object.entries(checked).filter(([,v]) => v).map(([k]) => k)
  const allIngredients = [...checkedItems, ...(freeText.trim() ? freeText.split(/[,、\n]+/).map(s => s.trim()).filter(Boolean) : [])]
  const canAnalyze = inputMode==='photo' ? !!imageData : allIngredients.length > 0

  const handleImage = f => {
    if (!f) return
    const r = new FileReader()
    r.onload = e => { setImagePreview(e.target.result); setImageData(e.target.result.split(',')[1]) }
    r.readAsDataURL(f)
  }

  // ✅ fetch先は /api/recipe（サーバーサイド経由）。APIキーはブラウザに露出しない。
  const analyze = async () => {
    if (!canAnalyze) return
    setScreen('analyzing'); setError('')
    try {
      const body = inputMode==='photo'
        ? { imageBase64: imageData, cuisineType, mealType, profile }
        : { ingredients: allIngredients, cuisineType, mealType, profile }

      const res = await fetch('/api/recipe', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTPエラー: ${res.status}`)
      if (!data.meals || data.meals.length < 3) throw new Error('献立データが不完全です')
      setMeals(data)
      setScreen('result')
    } catch (e) {
      setError(e.message || '不明なエラー')
      setScreen('home')
    }
  }

  const reset = () => {
    setInputMode(null); setImageData(null); setImagePreview(null)
    setChecked({}); setFreeText('')
    setCuisineType(null); setMealType(null); setMealTypeStep(false)
    setMeals(null); setError('')
  }

  const BG = { minHeight:'100vh', background:'linear-gradient(170deg,#0a1628 0%,#1a2840 40%,#0d2035 100%)', fontFamily:"'Noto Sans JP',sans-serif", paddingBottom:'80px' }

  return (
    <div style={BG}>
      <style>{`
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.97)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(99,179,237,0.3);border-radius:4px}
      `}</style>

      {/* ── ウェルカム画面 ── */}
      {screen==='welcome' && (
        <div style={{ padding:'60px 24px 0', textAlign:'center', animation:'fadeSlideIn 0.5s ease both' }}>
          <div style={{ fontSize:'60px', marginBottom:'16px', filter:'drop-shadow(0 0 20px rgba(99,179,237,0.6))' }}>🍱</div>
          <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'26px', fontWeight:900, background:'linear-gradient(135deg,#63b3ed,#90cdf4,#e2e8f0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'8px' }}>まかせて！AIシェフ</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'36px', lineHeight:'1.8' }}>冷蔵庫の食材から献立を自動提案<br/>栄養・節約・時短アドバイスつき</div>

          <div style={{ background:'linear-gradient(135deg,rgba(99,179,237,0.15),rgba(144,205,244,0.08))', border:'1px solid rgba(99,179,237,0.3)', borderRadius:'16px', padding:'16px 20px', marginBottom:'20px', textAlign:'left' }}>
            <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'15px', color:'#fff', marginBottom:'6px' }}>🎁 7日間　無料トライアル</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:'1.7' }}>すべての機能が7日間無料。期間後は月額 <span style={{ color:'#63b3ed', fontWeight:700 }}>¥480</span>（いつでも解約可）</div>
            <div style={{ marginTop:'10px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {['✅ AIシェフ会話','✅ 献立自動提案','✅ 栄養アドバイス','✅ 広告なし'].map(f => (
                <span key={f} style={{ fontSize:'11px', background:'rgba(99,179,237,0.15)', color:'#90cdf4', borderRadius:'10px', padding:'2px 9px' }}>{f}</span>
              ))}
            </div>
          </div>

          {/* チャット表示スタイル選択 */}
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'14px 16px', marginBottom:'20px', textAlign:'left' }}>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'10px' }}>🎨 AIシェフの表示スタイルを選ぶ</div>
            <div style={{ display:'flex', gap:'10px' }}>
              {[{k:'B',l:'📋 会話パネル型',s:'献立の下に会話欄'},{k:'A',l:'💬 フローティング型',s:'画面右下のボタン'}].map(m => (
                <div key={m.k} onClick={() => setChatMode(m.k)} style={{ flex:1, padding:'10px 12px', borderRadius:'12px', cursor:'pointer', border:chatMode===m.k?'2px solid #63b3ed':'1px solid rgba(255,255,255,0.1)', background:chatMode===m.k?'rgba(99,179,237,0.12)':'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontWeight:700, fontSize:'12px', color:'#fff', marginBottom:'3px' }}>{m.l}</div>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>{m.s}</div>
                </div>
              ))}
            </div>
          </div>

          <PrimaryBtn onClick={() => setScreen('survey')}>🚀 無料体験をはじめる</PrimaryBtn>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginTop:'12px' }}>クレジットカード不要 · 7日間完全無料</div>
        </div>
      )}

      {/* ── アンケート ── */}
      {screen==='survey' && (
        <>
          <div style={{ padding:'28px 16px 20px', textAlign:'center' }}>
            <div style={{ fontSize:'36px', marginBottom:'8px' }}>📝</div>
            <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'19px', fontWeight:900, color:'#fff', marginBottom:'4px' }}>はじめに教えてください</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>あなたに合った献立・アドバイスに活用します</div>
          </div>
          <SurveyScreen onComplete={a => { setProfile(a); setScreen('home') }} />
        </>
      )}

      {/* ── 設定 ── */}
      {screen==='settings' && (
        <>
          <div style={{ padding:'24px 16px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
            <button onClick={() => setScreen('home')} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'10px', color:'rgba(255,255,255,0.6)', fontSize:'13px', padding:'6px 12px', cursor:'pointer' }}>← 戻る</button>
            <span style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'16px', color:'#fff' }}>⚙️ プロフィール設定</span>
          </div>
          <SurveyScreen onComplete={a => { setProfile(a); setScreen('home') }} />
        </>
      )}

      {/* ── ホーム（食材入力） ── */}
      {screen==='home' && (
        <div style={{ animation:'fadeSlideIn 0.4s ease both' }}>
          {/* ヘッダー */}
          <div style={{ padding:'20px 16px 14px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'18px', fontWeight:900, background:'linear-gradient(135deg,#63b3ed,#90cdf4,#e2e8f0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'2px' }}>🧊 まかせて！AIシェフ</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>食材を伝えるだけで今日の献立を提案</div>
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <div style={{ background:'rgba(99,179,237,0.15)', border:'1px solid rgba(99,179,237,0.3)', borderRadius:'10px', padding:'4px 10px', fontSize:'11px', color:'#63b3ed', fontWeight:600 }}>🎁 残り{daysLeft}日</div>
              <button onClick={() => setScreen('settings')} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'18px', padding:'6px 8px', cursor:'pointer', lineHeight:1 }}>⚙️</button>
            </div>
          </div>

          {/* プロフィールバッジ */}
          {profile && (
            <div style={{ margin:'0 16px 14px', background:'rgba(99,179,237,0.07)', border:'1px solid rgba(99,179,237,0.18)', borderRadius:'12px', padding:'9px 13px' }}>
              <div style={{ fontSize:'11px', color:'#63b3ed', fontWeight:600, marginBottom:'5px' }}>👤 あなたの設定に合わせて提案します</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                {profile.priority && <span style={{ fontSize:'11px', background:'rgba(99,179,237,0.18)', color:'#90cdf4', borderRadius:'10px', padding:'2px 8px' }}>{profile.priority}</span>}
                {profile.health?.filter(h => h!=='特になし').slice(0,3).map(h => <span key={h} style={{ fontSize:'11px', background:'rgba(99,179,237,0.12)', color:'#90cdf4', borderRadius:'10px', padding:'2px 8px' }}>{h}</span>)}
                {profile.allergy?.filter(a => a!=='特にない').map(a => <span key={a} style={{ fontSize:'11px', background:'rgba(252,129,129,0.18)', color:'#fc8181', borderRadius:'10px', padding:'2px 8px' }}>⚠️{a}</span>)}
              </div>
            </div>
          )}

          <div style={{ padding:'0 16px' }}>
            {/* エラー表示 */}
            {error && (
              <div style={{ background:'rgba(252,129,129,0.1)', border:'1.5px solid rgba(252,129,129,0.4)', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px' }}>
                <div style={{ color:'#fc8181', fontSize:'13px', fontWeight:700, marginBottom:'4px' }}>⚠️ エラーが発生しました</div>
                <div style={{ color:'rgba(252,129,129,0.8)', fontSize:'12px', lineHeight:'1.6', wordBreak:'break-all' }}>{error}</div>
              </div>
            )}

            {/* 入力方法選択 */}
            {!inputMode && (
              <div>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textAlign:'center', marginBottom:'13px' }}>食材の入力方法を選んでください</div>
                {[
                  {key:'photo', emoji:'📸', title:'写真で撮る', sub:'冷蔵庫を撮影してAIが自動読み取り'},
                  {key:'check', emoji:'✅', title:'今ある食材を選ぶ', sub:'一覧からタップ＋リストにない食材も追加できる'},
                ].map(m => (
                  <div key={m.key} onClick={() => setInputMode(m.key)} style={{ background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(99,179,237,0.18)', borderRadius:'16px', padding:'15px', marginBottom:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ fontSize:'26px', width:'46px', height:'46px', background:'rgba(99,179,237,0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{m.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'14px', color:'#fff', marginBottom:'2px' }}>{m.title}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.38)' }}>{m.sub}</div>
                    </div>
                    <div style={{ color:'rgba(99,179,237,0.5)', fontSize:'20px' }}>›</div>
                  </div>
                ))}
              </div>
            )}

            {/* 📸 写真モード */}
            {inputMode==='photo' && (
              <div style={{ animation:'fadeSlideIn 0.35s ease both' }}>
                <BackBar onBack={() => { setInputMode(null); setCuisineType(null); setMealType(null) }} label='📸 写真で撮る' />
                <div onDrop={e => { e.preventDefault(); handleImage(e.dataTransfer.files[0]) }}
                  onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                  style={{ border:imagePreview?'2px solid #63b3ed':'2px dashed rgba(99,179,237,0.35)', borderRadius:'18px', background:'rgba(99,179,237,0.03)', minHeight:'160px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', marginBottom:'12px' }}>
                  {imagePreview
                    ? <img src={imagePreview} alt='' style={{ width:'100%', maxHeight:'240px', objectFit:'cover', borderRadius:'16px' }} />
                    : (<><div style={{ fontSize:'38px', marginBottom:'8px', opacity:0.45 }}>🧊</div><div style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px' }}>冷蔵庫の写真をアップロード</div><div style={{ color:'rgba(255,255,255,0.22)', fontSize:'11px', marginTop:'3px' }}>タップまたはドラッグ＆ドロップ</div></>)}
                </div>
                <input ref={fileRef} type='file' accept='image/*' style={{ display:'none' }} onChange={e => handleImage(e.target.files?.[0] || null)} />

                {/* ジャンル選択 */}
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'13px 14px', marginBottom:'12px' }}>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px', fontWeight:600 }}>🍽️ 料理のジャンル（任意）</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginBottom:'10px' }}>
                    {CUISINE_OPTIONS.map(opt => (
                      <div key={opt.key} onClick={() => setCuisineType(cuisineType===opt.key ? null : opt.key)}
                        style={{ padding:'6px 12px', borderRadius:'16px', cursor:'pointer', fontSize:'12px', background:cuisineType===opt.key?'rgba(99,179,237,0.2)':'rgba(255,255,255,0.07)', color:cuisineType===opt.key?'#90cdf4':'rgba(255,255,255,0.65)', border:cuisineType===opt.key?'1.5px solid #63b3ed':'1px solid rgba(255,255,255,0.13)', fontWeight:cuisineType===opt.key?700:400, transition:'all 0.15s' }}>
                        {cuisineType===opt.key?'✓ ':''}{opt.key}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px', fontWeight:600 }}>🥩 メイン食材系（任意）</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                    {MEAL_TYPE_OPTIONS.map(opt => (
                      <div key={opt} onClick={() => setMealType(mealType===opt ? null : opt)}
                        style={{ padding:'6px 12px', borderRadius:'16px', cursor:'pointer', fontSize:'12px', background:mealType===opt?'rgba(251,211,141,0.2)':'rgba(255,255,255,0.07)', color:mealType===opt?'#fbd38d':'rgba(255,255,255,0.65)', border:mealType===opt?'1.5px solid #fbd38d':'1px solid rgba(255,255,255,0.13)', fontWeight:mealType===opt?700:400, transition:'all 0.15s' }}>
                        {mealType===opt?'✓ ':''}{opt}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:'9px', fontSize:'11px', color:'#fbd38d' }}>💡 選択と違うジャンルが時短な場合、AIが提案することもあります</div>
                </div>
                <PrimaryBtn active={!!imageData} onClick={analyze}>✨ 食材を解析して献立を提案</PrimaryBtn>
              </div>
            )}

            {/* ✅ チェックモード */}
            {inputMode==='check' && (
              <div style={{ animation:'fadeSlideIn 0.35s ease both' }}>
                <BackBar onBack={() => { if(mealTypeStep){setMealTypeStep(false)}else{setInputMode(null);setMealType(null);setCuisineType(null)} }}
                  label={mealTypeStep ? '🧊 今ある食材を選ぶ' : '🍽️ どんな料理を作りたい？'} />

                {/* STEP1: ジャンル選択 */}
                {!mealTypeStep && (
                  <div>
                    <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', marginBottom:'16px', lineHeight:'1.7' }}>
                      今日はどんな料理が食べたいですか？<br/>
                      <span style={{ color:'#fbd38d', fontSize:'11px' }}>💡 食材によってはより時短な別ジャンルをAIが提案することもあります</span>
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', fontWeight:600, marginBottom:'10px' }}>🍽️ 料理のジャンル</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                      {CUISINE_OPTIONS.map(opt => (
                        <div key={opt.key} onClick={() => setCuisineType(cuisineType===opt.key ? null : opt.key)}
                          style={{ background:cuisineType===opt.key?'rgba(99,179,237,0.2)':'rgba(255,255,255,0.04)', border:cuisineType===opt.key?'2px solid #63b3ed':'1px solid rgba(255,255,255,0.09)', borderRadius:'14px', padding:'12px 13px', cursor:'pointer', transition:'all 0.15s' }}>
                          <div style={{ fontSize:'14px', color:'#fff', fontWeight:cuisineType===opt.key?700:400, fontFamily:"'Noto Serif JP',serif", marginBottom:'3px' }}>{cuisineType===opt.key?'✓ ':''}{opt.key}</div>
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', fontWeight:600, marginBottom:'10px' }}>🥩 メインの食材系（任意）</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginBottom:'20px' }}>
                      {MEAL_TYPE_OPTIONS.map(opt => (
                        <div key={opt} onClick={() => setMealType(mealType===opt ? null : opt)}
                          style={{ padding:'7px 13px', borderRadius:'16px', cursor:'pointer', fontSize:'12px', background:mealType===opt?'rgba(251,211,141,0.25)':'rgba(255,255,255,0.06)', color:mealType===opt?'#fbd38d':'rgba(255,255,255,0.65)', border:mealType===opt?'1.5px solid #fbd38d':'1px solid rgba(255,255,255,0.12)', fontWeight:mealType===opt?700:400, transition:'all 0.15s' }}>
                          {mealType===opt?'✓ ':''}{opt}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:'10px' }}>
                      <button onClick={() => { setCuisineType(null); setMealType(null); setMealTypeStep(true) }} style={{ flex:'0 0 auto', padding:'14px 16px', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap' }}>スキップして食材へ →</button>
                      <div style={{ flex:1 }}><PrimaryBtn active={!!(cuisineType||mealType)} onClick={() => setMealTypeStep(true)}>今ある食材を選ぶ →</PrimaryBtn></div>
                    </div>
                  </div>
                )}

                {/* STEP2: 食材チェック */}
                {mealTypeStep && (
                  <div>
                    {(cuisineType||mealType) && (
                      <div style={{ background:'rgba(99,179,237,0.1)', border:'1px solid rgba(99,179,237,0.25)', borderRadius:'10px', padding:'8px 13px', marginBottom:'12px', display:'flex', flexWrap:'wrap', gap:'6px', alignItems:'center' }}>
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>希望：</span>
                        {cuisineType && <span style={{ fontSize:'12px', background:'rgba(99,179,237,0.2)', color:'#90cdf4', borderRadius:'10px', padding:'2px 10px', fontWeight:600 }}>{cuisineType}</span>}
                        {mealType && <span style={{ fontSize:'12px', background:'rgba(251,211,141,0.2)', color:'#fbd38d', borderRadius:'10px', padding:'2px 10px', fontWeight:600 }}>{mealType}</span>}
                      </div>
                    )}
                    {allIngredients.length > 0 && (
                      <div style={{ background:'rgba(99,179,237,0.09)', border:'1px solid rgba(99,179,237,0.22)', borderRadius:'12px', padding:'9px 13px', marginBottom:'11px' }}>
                        <div style={{ color:'#63b3ed', fontSize:'11px', fontWeight:600, marginBottom:'5px' }}>
                          ✓ 選択中 {allIngredients.length}品目
                          {allIngredients.length > 10 && <span style={{ color:'#fbd38d', marginLeft:'6px' }}>（多い場合はAIが厳選します）</span>}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                          {checkedItems.map(item => <span key={item} onClick={() => setChecked(p => ({...p,[item]:false}))} style={{ fontSize:'11px', background:'rgba(99,179,237,0.18)', color:'#90cdf4', borderRadius:'10px', padding:'2px 8px', cursor:'pointer' }}>{item} ×</span>)}
                        </div>
                      </div>
                    )}
                    {INGREDIENT_SHEET.map(cat => (
                      <div key={cat.category} style={{ marginBottom:'7px' }}>
                        <div onClick={() => setOpenCat(openCat===cat.category ? null : cat.category)}
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:openCat===cat.category?'12px 12px 0 0':'12px', padding:'11px 15px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'13px', color:'#fff' }}>{cat.category}</span>
                          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                            {cat.items.filter(i => checked[i]).length > 0 && <span style={{ fontSize:'11px', background:'#63b3ed', color:'#0a1628', borderRadius:'10px', padding:'1px 7px', fontWeight:700 }}>{cat.items.filter(i => checked[i]).length}</span>}
                            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px' }}>{openCat===cat.category?'▲':'▼'}</span>
                          </div>
                        </div>
                        {openCat===cat.category && (
                          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderTop:'none', borderRadius:'0 0 12px 12px', padding:'11px 13px', display:'flex', flexWrap:'wrap', gap:'7px' }}>
                            {cat.items.map(item => <Tag key={item} label={item} active={!!checked[item]} onClick={() => setChecked(p => ({...p,[item]:!p[item]}))} />)}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* リストにない食材の自由入力 */}
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'14px', padding:'13px 14px', marginTop:'10px', marginBottom:'14px' }}>
                      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px', fontWeight:600 }}>✏️ リストにない食材を追加</div>
                      <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
                        placeholder={'例：れんこん、ごぼう、あさり…\nカンマや改行で区切ってください'} rows={3}
                        style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid rgba(99,179,237,0.25)', background:'rgba(0,0,0,0.2)', color:'#fff', fontSize:'13px', fontFamily:"'Noto Sans JP',sans-serif", resize:'none', outline:'none', boxSizing:'border-box', lineHeight:'1.6' }} />
                    </div>
                    <PrimaryBtn active={allIngredients.length > 0} onClick={analyze}>
                      {allIngredients.length > 0 ? `✨ ${allIngredients.length}品目で献立を提案` : '✨ 食材を選んでください'}
                    </PrimaryBtn>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 解析中 ── */}
      {screen==='analyzing' && (
        <div style={{ textAlign:'center', padding:'80px 20px', animation:'fadeSlideIn 0.4s ease both' }}>
          <div style={{ fontSize:'54px', marginBottom:'14px', animation:'pulse 1.5s ease infinite' }}>🔍</div>
          <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>食材を解析中…</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', marginBottom:'28px' }}>AIがあなたに合った献立を考えています</div>
          <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#63b3ed', animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      {/* ── 結果 ── */}
      {screen==='result' && meals && (
        <div style={{ padding:'0 16px', animation:'fadeSlideIn 0.5s ease both' }}>
          <div style={{ padding:'18px 0 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'17px', fontWeight:900, color:'#fff' }}>🍽️ 今日の献立</div>
            <div style={{ display:'flex', gap:'8px' }}>
              <div style={{ background:'rgba(99,179,237,0.15)', border:'1px solid rgba(99,179,237,0.3)', borderRadius:'10px', padding:'4px 10px', fontSize:'11px', color:'#63b3ed', fontWeight:600 }}>🎁 残り{daysLeft}日</div>
              <button onClick={() => setScreen('settings')} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'17px', padding:'5px 7px', cursor:'pointer', lineHeight:1 }}>⚙️</button>
            </div>
          </div>

          {/* 時短クロスジャンルアドバイス */}
          {meals.shortcut_tip && (
            <div style={{ background:'linear-gradient(135deg,rgba(251,211,141,0.15),rgba(246,173,85,0.08))', border:'1.5px solid rgba(251,211,141,0.4)', borderRadius:'16px', padding:'14px 16px', marginBottom:'16px' }}>
              <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'12px', color:'#fbd38d', marginBottom:'5px' }}>💡 AIシェフからのひと言</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)', lineHeight:'1.7' }}>{meals.shortcut_tip}</div>
            </div>
          )}

          {/* 使用食材 */}
          <div style={{ background:'rgba(99,179,237,0.07)', border:'1px solid rgba(99,179,237,0.18)', borderRadius:'13px', padding:'11px 13px', marginBottom:'14px' }}>
            <div style={{ color:'#63b3ed', fontSize:'11px', fontWeight:600, marginBottom:'6px' }}>🧊 使用食材</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {meals.ingredients_found?.map((ing, i) => <span key={i} style={{ fontSize:'11px', background:'rgba(99,179,237,0.14)', color:'#90cdf4', borderRadius:'10px', padding:'2px 9px', border:'1px solid rgba(99,179,237,0.18)' }}>{ing}</span>)}
            </div>
          </div>

          {/* 献立カード（無料/有料で nutrition_tip の表示を切り替え） */}
          {meals.meals?.map((meal, i) => {
            const colors=['#e8f4e8','#fff3e0','#fce4ec']
            const borders=['#81c784','#ffb74d','#f48fb1']
            const emojis=['🌅','☀️','🌙']
            const labels=['朝食','昼食','夕食']
            return (
              <div key={i} style={{ background:colors[i], border:`1.5px solid ${borders[i]}`, borderRadius:'16px', padding:'15px', marginBottom:'12px', animation:`fadeSlideIn 0.4s ease ${i*0.12}s both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'8px' }}>
                  <span style={{ fontSize:'17px' }}>{emojis[i]}</span>
                  <span style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'12px', color:'#555', background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'2px 9px' }}>{labels[i]}</span>
                </div>
                <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:900, fontSize:'16px', color:'#2d1a0e', marginBottom:'5px', lineHeight:'1.4' }}>{meal.title}</div>
                <div style={{ fontSize:'13px', color:'#555', marginBottom:'8px', lineHeight:'1.6' }}>{meal.description}</div>
                {/* 💡 有料/無料で出し分け */}
                {meal.nutrition_tip && (
                  isPaid ? (
                    <div style={{ background:'rgba(255,255,255,0.65)', border:`1px solid ${borders[i]}`, borderRadius:'10px', padding:'8px 11px', marginBottom:'8px', fontSize:'12px', color:'#444', lineHeight:'1.6' }}>
                      💡 {meal.nutrition_tip}
                    </div>
                  ) : (
                    <div onClick={() => alert('有料プランにアップグレードすると栄養・時短アドバイスがすべて表示されます！\n月額¥480 / いつでも解約可')}
                      style={{ background:'rgba(0,0,0,0.06)', border:`1px dashed ${borders[i]}`, borderRadius:'10px', padding:'8px 11px', marginBottom:'8px', fontSize:'12px', color:'#999', cursor:'pointer', userSelect:'none' }}>
                      🔒 有料プランで表示（タップで詳細）
                    </div>
                  )
                )}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'7px' }}>
                  {meal.ingredients?.map((ing, j) => <span key={j} style={{ fontSize:'11px', background:'rgba(255,255,255,0.8)', border:`1px solid ${borders[i]}`, borderRadius:'10px', padding:'2px 7px', color:'#444' }}>{ing}</span>)}
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <span style={{ fontSize:'12px', color:'#777' }}>⏱ {meal.time}</span>
                  <span style={{ fontSize:'12px', color:'#777' }}>💰 {meal.cost}</span>
                </div>
              </div>
            )
          })}

          {/* AIシェフ チャット（Bパターン：インライン） */}
          {chatMode==='B' && <InlineChat profile={profile} ingredients={meals.ingredients_found?.join('、') || ''} />}

          {/* 有料プラン誘導（無料版のみ） */}
          {!isPaid && (
            <div style={{ background:'linear-gradient(135deg,rgba(99,179,237,0.15),rgba(144,205,244,0.08))', border:'1px solid rgba(99,179,237,0.3)', borderRadius:'16px', padding:'16px', marginBottom:'16px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'14px', color:'#fff', marginBottom:'6px' }}>🌟 有料プランにアップグレード</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', marginBottom:'12px', lineHeight:'1.7' }}>栄養アドバイス・時短テクニック・AIシェフ無制限<br/>月額 <span style={{ color:'#63b3ed', fontWeight:700 }}>¥480</span> / いつでも解約可</div>
              <button onClick={() => setIsPaid(true)} style={{ padding:'10px 24px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#2b6cb0,#63b3ed)', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Noto Serif JP',serif" }}>
                アップグレードする →
              </button>
            </div>
          )}

          <button onClick={() => { reset(); setScreen('home') }} style={{ width:'100%', padding:'13px', borderRadius:'13px', border:'1.5px solid rgba(255,255,255,0.14)', background:'transparent', color:'rgba(255,255,255,0.45)', fontSize:'13px', fontFamily:"'Noto Serif JP',serif", cursor:'pointer' }}>
            🔄 別の食材で再提案
          </button>
        </div>
      )}

      {/* AIシェフ フローティングボタン（Aパターン） */}
      {chatMode==='A' && (screen==='home' || screen==='result') && (
        <FloatingChat profile={profile} ingredients={meals?.ingredients_found?.join('、') || ''} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// AIシェフ フローティングチャット（Aパターン）
// ─────────────────────────────────────────────
function FloatingChat({ profile, ingredients }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role:'assistant', content:'こんにちは！食材について何でも聞いてね😊' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { if(open) bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, open])

  const send = async () => {
    const userMsg = input.trim()
    if (!userMsg || loading) return
    setInput('')
    const newMsgs = [...messages, { role:'user', content:userMsg }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role:m.role, content:m.content })), profile, ingredients })
      })
      const data = await res.json()
      setMessages(m => [...m, { role:'assistant', content: data.text || 'うまく答えられませんでした😅' }])
    } catch {
      setMessages(m => [...m, { role:'assistant', content:'通信エラーが発生しました。' }])
    }
    setLoading(false)
  }

  return (
    <>
      <div onClick={() => setOpen(o => !o)} style={{ position:'fixed', bottom:'24px', right:'20px', width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,#2b6cb0,#63b3ed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', cursor:'pointer', boxShadow:'0 6px 20px rgba(99,179,237,0.5)', zIndex:100 }}>
        {open ? '✕' : '💬'}
      </div>
      {open && (
        <div style={{ position:'fixed', bottom:'92px', right:'16px', width:'300px', maxHeight:'400px', background:'#1a2840', border:'1px solid rgba(99,179,237,0.3)', borderRadius:'20px', boxShadow:'0 12px 40px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', zIndex:99, animation:'fadeSlideIn 0.25s ease both' }}>
          <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'20px' }}>👩‍🍳</span>
            <div>
              <div style={{ fontFamily:"'Noto Serif JP',serif", fontWeight:700, fontSize:'13px', color:'#fff' }}>AIシェフに相談</div>
              <div style={{ fontSize:'10px', color:'#63b3ed' }}>● オンライン</div>
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:'6px', alignItems:'flex-end' }}>
                {m.role==='assistant' && <div style={{ fontSize:'18px', flexShrink:0 }}>👩‍🍳</div>}
                <div style={{ maxWidth:'80%', padding:'9px 12px', borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background:m.role==='user'?'linear-gradient(135deg,#2b6cb0,#63b3ed)':'rgba(255,255,255,0.08)', color:'#fff', fontSize:'12px', lineHeight:'1.6' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:'6px' }}>
                <div style={{ fontSize:'18px' }}>👩‍🍳</div>
                <div style={{ padding:'9px 14px', borderRadius:'16px 16px 16px 4px', background:'rgba(255,255,255,0.08)', display:'flex', gap:'4px', alignItems:'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#63b3ed', animation:`pulse 1s ease ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:'6px 10px', display:'flex', gap:'5px', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            {['カサ増しは？','時短で作りたい','節約レシピ','栄養アドバイス'].map(q => (
              <div key={q} onClick={() => setInput(q)} style={{ fontSize:'10px', background:'rgba(99,179,237,0.15)', color:'#90cdf4', borderRadius:'10px', padding:'3px 8px', cursor:'pointer', border:'1px solid rgba(99,179,237,0.2)' }}>{q}</div>
            ))}
          </div>
          <div style={{ padding:'8px 10px 12px', display:'flex', gap:'6px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder='質問を入力…' style={{ flex:1, padding:'8px 12px', borderRadius:'20px', border:'1px solid rgba(99,179,237,0.3)', background:'rgba(0,0,0,0.3)', color:'#fff', fontSize:'12px', outline:'none', fontFamily:"'Noto Sans JP',sans-serif" }} />
            <button onClick={send} disabled={!input.trim()||loading} style={{ width:'36px', height:'36px', borderRadius:'50%', border:'none', background:input.trim()?'#63b3ed':'rgba(255,255,255,0.1)', color:input.trim()?'#0a1628':'rgba(255,255,255,0.3)', fontSize:'14px', cursor:input.trim()?'pointer':'default', flexShrink:0 }}>➤</button>
          </div>
        </div>
      )}
    </>
  )
}

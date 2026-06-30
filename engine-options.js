// ── 生成AIエンジンの選択肢定義 ──────────────────────────────────
// 新しいモデル・機能が増えたらこのファイルにオブジェクトを追加するだけでよい。
// chat.js側のロジック・index.html・style.cssは一切変更不要。
//
// 各フィールドの意味:
//   id    : 内部識別子（一意であること）
//   label : ドロップダウンに表示される短いラベル
//   desc  : ドロップダウンに表示される説明文
//   path  : API_BASE_URLに続けてfetchするパス（CloudFront/API Gatewayのルーティング先）

const ENGINE_OPTIONS = [
    {
    id:    "nova-chat",
    label: "Nova（Web検索無し）",
    desc:  "Amazon Novaが回答します",
    path:  "/chat-nova",
  },
  {
    id:    "nova-search-aws",
    label: "Nova + Web検索(AWS)",
    desc:  "Amazon Novaがリアルタイムで検索して回答します(AWS)",
    path:  "/chat-nova-harness-aws",
  },
  {
    id:    "nova-search-tavily",
    label: "Nova + Web検索(Tavily)",
    desc:  "Amazon Novaがリアルタイムで検索して回答します(Tavily)",
    path:  "/chat-nova-harness-tavily",
  }
];
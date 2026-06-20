// フェーズ1用のダミーデータです。
// フェーズ4でAPI Gateway + Lambda + DynamoDBに置き換わります。
const dummyTickets = [
  {
    id: "INQ-1049",
    subject: "ログインができない",
    requester: "佐藤 美咲",
    email: "m.sato@example.com",
    priority: "urgent",
    status: "open",
    receivedAt: "2026-06-20 09:14"
  },
  {
    id: "INQ-1048",
    subject: "請求書の再発行について",
    requester: "田中 健一",
    email: "k.tanaka@example.com",
    priority: "normal",
    status: "in_progress",
    receivedAt: "2026-06-19 17:02"
  },
  {
    id: "INQ-1047",
    subject: "パスワード再設定メールが届かない",
    requester: "鈴木 彩",
    email: "a.suzuki@example.com",
    priority: "urgent",
    status: "open",
    receivedAt: "2026-06-19 14:48"
  },
  {
    id: "INQ-1046",
    subject: "プランのアップグレード方法を知りたい",
    requester: "高橋 翔太",
    email: "s.takahashi@example.com",
    priority: "low",
    status: "resolved",
    receivedAt: "2026-06-18 11:20"
  },
  {
    id: "INQ-1045",
    subject: "CSVエクスポートの文字化けについて",
    requester: "伊藤 直人",
    email: "n.ito@example.com",
    priority: "normal",
    status: "in_progress",
    receivedAt: "2026-06-18 10:05"
  },
  {
    id: "INQ-1044",
    subject: "退会手続きの方法",
    requester: "渡辺 結衣",
    email: "y.watanabe@example.com",
    priority: "low",
    status: "resolved",
    receivedAt: "2026-06-17 16:33"
  },
  {
    id: "INQ-1043",
    subject: "決済エラーが発生して処理が進まない",
    requester: "山本 大輔",
    email: "d.yamamoto@example.com",
    priority: "urgent",
    status: "in_progress",
    receivedAt: "2026-06-17 09:51"
  },
  {
    id: "INQ-1042",
    subject: "通知メールの頻度を変更したい",
    requester: "中村 さくら",
    email: "s.nakamura@example.com",
    priority: "low",
    status: "open",
    receivedAt: "2026-06-16 13:27"
  }
];

-- メッセージテーブルの作成
-- ユーザーのトーク履歴を保存するテーブル

CREATE TABLE IF NOT EXISTS user_messages (
  user_id TEXT PRIMARY KEY,
  messages JSONB NOT NULL,
  message_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_updated_at ON user_messages(updated_at);

-- コメント追加
COMMENT ON TABLE user_messages IS 'ユーザーのLINEトーク履歴を保存';
COMMENT ON COLUMN user_messages.user_id IS 'LINEユーザーID';
COMMENT ON COLUMN user_messages.messages IS 'パースされたメッセージの配列（JSON形式）';
COMMENT ON COLUMN user_messages.message_count IS 'メッセージ数';
COMMENT ON COLUMN user_messages.created_at IS '初回作成日時';
COMMENT ON COLUMN user_messages.updated_at IS '最終更新日時';

-- Row Level Security (RLS) を無効化（管理者のみアクセス可能）
ALTER TABLE user_messages DISABLE ROW LEVEL SECURITY;
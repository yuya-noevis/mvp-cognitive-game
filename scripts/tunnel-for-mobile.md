# スマホで確認する（トンネルで公開URLを発行）

502 が出る場合は **先に開発サーバーを起動** してから、トンネルを張ってください。

## 手順

### 1. ターミナル①：開発サーバーを起動

```bash
cd /Users/ogawayuuya/Cursor:Claude/mvp-cognitive-game
npm run dev
```

**「✓ Ready in ...」** と表示されるまで待つ。

### 2. ターミナル②：新しいタブでトンネルを張る

```bash
cd /Users/ogawayuuya/Cursor:Claude/mvp-cognitive-game
npx cloudflared tunnel --url http://127.0.0.1:3000
```

表示された **https://xxxx.trycloudflare.com** のURLをスマホのブラウザで開く。

- トンネルはこのターミナルを閉じるまで有効です。
- 開発サーバー（ターミナル①）を止めると 502 になります。

### 代替：同じWi-FiならローカルIPで開く

開発サーバー起動後、MacのIPを確認:

```bash
ipconfig getifaddr en0
```

スマホで **http://（表示されたIP）:3000** を開く（例: http://192.168.1.10:3000）。  
※ スマホとPCが同じWi-Fiに接続されていること。

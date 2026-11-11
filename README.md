# misyaguziya's Repository

VRChat関連のソフトウェアとツールを紹介する、デスクトップ風のポートフォリオです。

公開URL: https://misyaguziya.github.io/

## 開発

Node.js 22以降を使用します。

```sh
npm ci --prefix website
npm run dev --prefix website
npm test --prefix website
npm run build --prefix website
```

編集元は `website/src/`、壁紙は `website/public/assets/` にあります。
ビルドすると、公開用の `index.html` と `assets/` がリポジトリ直下に生成されます。
ソースと生成物を一緒にコミットして `main` にpushすると、既存のGitHub Pages設定で公開されます。
`website/` はJekyllの公開対象から除外しています。

## 操作

- タイトルバーをドラッグしてウィンドウを移動
- 最小化・最大化・閉じるボタンで表示を切り替え
- デスクトップのフォルダー、または下部のタスクバーから再表示
- タイトルバーにフォーカスして矢印キーで移動、Enterで最大化・復元
- スマートフォンではウィンドウ操作を省いた縦並びの作品一覧

JavaScriptが無効な場合も、6作品の紹介と13件のリンクを表示します。

## 素材

- アイコン: [Phosphor Icons](https://github.com/phosphor-icons/react) (MIT)
- フォント: Inter / Noto Sans JP (Google Fonts)
- 背景: このサイト向けに作成した画像

# Azure 環境へのセットアップ方法
このドキュメントでは、広聴AIアプリケーションをAzure Container Appsにデプロイする方法について説明します。

## 目次
1. 前提条件
2. 初期セットアップ
3. デプロイプロセス
4. 環境変数の設定
5. 運用コマンド
6. トラブルシューティング

## 前提条件

- Azureアカウント
- Dockerがインストールされた環境
- OpenAI APIキー

## 初期セットアップ

### 1. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な環境変数を設定します。

```bash
cp .env.example .env
```

特に以下の環境変数は重要です：

```
# API認証用キー
PUBLIC_API_KEY=your_public_key
ADMIN_API_KEY=your_admin_key

# BASIC認証用（管理画面）
BASIC_AUTH_USERNAME=your_username
BASIC_AUTH_PASSWORD=your_password

# OpenAI API設定
OPENAI_API_KEY=your_openai_key
```

また、Azure環境設定をカスタマイズする必要がある場合は、オプションで`.env.azure`ファイルを作成することができます。このファイルは必須ではなく、作成しなくても自動的にデフォルト値が使用されます。

```bash
cp .env.azure.example .env.azure
```

`.env.azure`ファイルでは以下のパラメータをカスタマイズできます：

```
# Azure環境特有の設定（すべてオプション）
AZURE_RESOURCE_GROUP=your-resource-group
AZURE_LOCATION=japaneast
AZURE_ACR_NAME=yourregistry
AZURE_ACR_SKU=Basic
AZURE_CONTAINER_ENV=your-container-env
AZURE_WORKSPACE_NAME=your-logs
```

これらの設定は任意で、未設定の場合はシステムが自動的に以下のデフォルト値を使用します：

### 2. Azureにログイン

```bash
make azure-login
```

表示されるURLにアクセスしてログインします。

## デプロイプロセス

### 一括デプロイ（推奨）

すべてのセットアップを一度に行うには：

```bash
make azure-setup-all
```

これにより、以下の手順が自動的に実行されます：

1. リソースグループとACRのセットアップ
2. ACRへのログイン
3. コンテナイメージのビルド
4. イメージのプッシュ
5. Container Appsへのデプロイ
6. ポリシーとヘルスチェックの適用
7. 環境変数の設定
8. 管理画面の環境変数を修正してビルド
9. 環境の検証
10. サービスURLの確認

全体のプロセスは初回実行時に約20分程度かかることがあります。

表示された client-admin の URL にアクセスし、BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD で設定した認証情報を入力することで、レポート生成ができます。

## 参考情報
### 手動ステップバイステップのデプロイ

個別のコマンドを実行することもできます：

```bash
# 1. リソースグループとACRのセットアップ
make azure-setup

# 2. ACRへのログイン
make azure-acr-login-auto

# 3. コンテナイメージのビルド
make azure-build

# 4. イメージをプッシュ
make azure-push

# 5. Container Appsへのデプロイ
make azure-deploy

# 待機（20秒）

# 6. ポリシーとヘルスチェックの適用
make azure-apply-policies

# 7. 環境変数の設定
make azure-config-update

# 待機（30秒）

# 8. 管理画面の環境変数を修正してビルド
make azure-fix-client-admin

# 9. 環境の検証
make azure-verify

# 10. サービスURLの確認
make azure-info
```

## 運用コマンド

### サービスURLの表示

```bash
make azure-info
```

### ステータス確認

```bash
make azure-status
```

### ログの確認

```bash
# クライアントログ
make azure-logs-client

# APIログ
make azure-logs-api

# 管理画面ログ
make azure-logs-admin
```

### コスト最適化

使用していない時間帯にコンテナをスケールダウンすることでコストを抑制できます：

```bash
# コンテナをスケールダウン
make azure-stop

# 再度使う時に起動
make azure-start
```

### リソースの完全削除

以下のコマンドで、作成したすべてのAzureリソースを削除できます：

```bash
make azure-cleanup
```

**注意**: このコマンドは取り消せません。すべてのリソースが完全に削除されます。

## トラブルシューティング

### 1. 環境変数の問題

環境変数が正しく設定されていない場合は：

```bash
make azure-fix-client-admin
```

### 2. デプロイ失敗時の検証

デプロイ状態を確認します：

```bash
make azure-verify
```

### 3. コンテナの再起動

問題が発生した場合、コンテナを再起動することで解決することがあります：

```bash
make azure-stop
sleep 10
make azure-start
```

### 4. ログの確認

エラーの詳細を確認するにはログを調査します：

```bash
make azure-logs-api
make azure-logs-client
make azure-logs-admin
```

### 5. デプロイ時のヘルスチェック設定問題

ヘルスチェック設定やポリシーの適用に問題がある場合：

```bash
make azure-apply-policies
```
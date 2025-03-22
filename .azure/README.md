# Azure設定ファイル

このディレクトリには、Azureデプロイに関連する設定ファイルが含まれています。

## 構成

- `templates/` - YAMLテンプレートファイル
  - `health/` - ヘルスチェック設定テンプレート
    - `api-health-probe.yaml` - APIコンテナのヘルスチェック設定
    - `client-health-probe.yaml` - クライアントコンテナのヘルスチェック設定
    - `client-admin-health-probe.yaml` - 管理者クライアントコンテナのヘルスチェック設定
  
  - `policies/` - ポリシー設定テンプレート
    - `api-pull-policy.yaml` - APIコンテナのイメージプルポリシー
    - `client-pull-policy.yaml` - クライアントコンテナのイメージプルポリシー
    - `client-admin-pull-policy.yaml` - 管理者クライアントコンテナのイメージプルポリシー

- `generated/` - デプロイ時に生成される実際のYAMLファイル（自動生成）

## テンプレートの使い方

テンプレートファイルには環境変数のプレースホルダとして以下の形式が使われています：

- `{{AZURE_ACR_NAME}}` - Azureコンテナレジストリ名
- `{{AZURE_RESOURCE_GROUP}}` - Azureリソースグループ名
- `{{AZURE_CONTAINER_ENV}}` - Container Apps環境名
- `{{AZURE_LOCATION}}` - Azureリージョン

これらは`prepare-yaml`コマンドによって、`.env`と`.env.azure`で定義された値に置換されます。

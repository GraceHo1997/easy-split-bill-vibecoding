# EasySplit 🧾💰

**智能帳單分帳工具** - AI 驅動的收據掃描與帳單分攤應用

## 功能特色

### 🤖 AI 智能 OCR 收據掃描
- 上傳收據照片，自動識別所有項目與價格
- 支援 Google Vision API 進行高精度文字識別
- 使用 Gemini AI 智能解析收據內容

### 📊 兩種分帳模式
- **個人項目計算**：每人選擇自己消費的項目，自動計算應付金額
- **共享分攤**：選擇共同消費的項目，平均分攤費用

### 💡 智能計算
- 自動識別小計、稅金、小費
- 支援手動輸入/調整小費金額
- 按比例分攤稅金與小費

### 📱 現代化 UI
- 響應式設計，支援手機與桌面
- 深色/淺色主題
- 直覺的步驟引導流程

## 技術架構

| 類別 | 技術 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 建構工具 | Vite |
| 樣式 | Tailwind CSS |
| UI 元件 | shadcn/ui |
| 後端 | Supabase Edge Functions |
| OCR | Google Cloud Vision API |
| AI 解析 | Lovable AI Gateway (Gemini) |

## 使用流程

```
1. 上傳收據 📷
      ↓
2. 輸入小費（若未偵測到）💵
      ↓
3. 選擇分帳模式 🔀
      ↓
4. 選擇/勾選項目 ✅
      ↓
5. 查看應付金額 💳
```

## 快速開始

### 環境需求
- Node.js 18+
- npm 或 bun

### 安裝步驟

```bash
# 1. 複製專案
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

### 環境變數設定

在 Supabase Edge Functions 中需設定以下密鑰：

| 變數名稱 | 說明 |
|----------|------|
| `GOOGLE_VISION_API_KEY` | Google Cloud Vision API 金鑰 |
| `LOVABLE_API_KEY` | Lovable AI Gateway API 金鑰（自動設定）|

## 專案結構

```
src/
├── components/
│   ├── ReceiptUpload.tsx      # 收據上傳元件
│   ├── TipInput.tsx           # 小費輸入元件
│   ├── CalculationModeSelector.tsx  # 分帳模式選擇
│   ├── ItemSelector.tsx       # 共享項目選擇
│   ├── IndividualItemCalculator.tsx # 個人項目計算
│   └── PaymentSummary.tsx     # 付款摘要
├── pages/
│   └── Index.tsx              # 主頁面
└── integrations/
    └── supabase/              # Supabase 整合

supabase/functions/
├── process-receipt/           # OCR 處理函數
└── interpret-receipt/         # AI 收據解析函數
```

## 部署

透過 [Lovable](https://lovable.dev) 平台一鍵部署：

1. 開啟專案
2. 點擊 **Share → Publish**
3. 完成！🎉

## 授權

MIT License

---

Built with ❤️ using [Lovable](https://lovable.dev)

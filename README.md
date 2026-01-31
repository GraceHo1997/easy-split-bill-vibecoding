# EasySplit 🧾✨

EasySplit is a web application that helps users **split restaurant bills fairly** using AI-powered receipt scanning and transparent cost breakdowns.
It combines OCR, AI semantic parsing, and a guided step-by-step UX to handle real-world receipts with shared items, tax, and tips.

---

## ✨ Key Features

- Upload restaurant receipts (JPG / PNG / PDF)
- OCR text extraction using **Google Cloud Vision API**
- AI-powered receipt interpretation via **Lovable AI Gateway (Gemini)**
- Automatic subtotal, tax, and tip calculation
- Per-item split by number of people
- Two calculation modes:
  - Individual Item Calculation
  - Shared Item Selection
- Export results as a shareable image
- Optimized sharing UX for desktop and mobile

---

## 🧱 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend / APIs
- **Google Cloud Vision API**
  - OCR text recognition from receipt images
- **Lovable AI Gateway (Gemini)**
  - AI semantic parsing of noisy OCR output
- **Supabase Edge Functions**
  - Serverless backend logic

### Deployment
- Frontend deployed via **Lovable platform**
- Backend logic handled by **Supabase Edge Functions**

---

## 🧭 User Flow 

### Step 1 — Upload Receipt
Users upload a receipt image via drag & drop or file selection.

Supported formats:
- JPG
- PNG
- PDF (up to 10MB)

---

### Step 2 — Add Tip Information
If a tip is not detected on the receipt, users can manually add it.

Options:
- Enter tip as a **percentage** (e.g. 20%)
- Enter tip as a **fixed amount**
- Skip tip entirely

Tip calculations are based on the **pre-tax subtotal by default**, following common U.S. tipping practices.

---

### Step 3 — Choose Calculation Method
Users choose how they want to calculate their share:

#### 🧮 Individual Item Calculation
- View the full breakdown of each item
- See base price, proportional tax, and tip per item
- Ideal for understanding the exact cost of each dish

#### 👥 Shared Selection
- Select only the items you ordered
- Specify how many people share each item
- Automatically splits tax and tip proportionally

---

### Step 4 — View Results & Share
EasySplit displays a clear breakdown including:
- Subtotal
- Tax
- Tip
- Final total

Each item shows:
- Base price
- Allocated tax
- Allocated tip
- Final per-item cost

Users can:
- 📥 Download the result as an image
- 📋 Copy the image (desktop)
- 📤 Share via native share menu (mobile)

---

## 📱 Cross-Device Sharing Strategy

| Platform | Primary Action | Fallback |
|--------|---------------|----------|
| Desktop | Copy as Image (Clipboard API) | Download Image |
| Mobile | Native Share (Web Share API) | Download Image |

This ensures a smooth sharing experience across browsers and devices.

---

## 🧠 System Architecture

Receipt Image -> Google Cloud Vision API (OCR) -> Raw OCR Text -> Lovable AI Gateway (Gemini) -> Structured JSON -> Frontend Calculation & Rendering


---

## 📌 Design Considerations

- Handles messy, real-world receipts with inconsistent formatting
- Avoids misleading “suggested gratuity” values printed on receipts
- Prioritizes transparency and user control in cost calculations
- Designed for both solo payments and shared dining scenarios

---

## 🚀 Future Improvements

- Google login & saved receipt history
- Shareable result links
- Editable item names and prices
- Improved OCR correction for low-quality images
- Multi-currency and locale support

---

Live Demo: https://easy-split-bill-project.lovable.app

Demo screenshots available in `/screenshots`


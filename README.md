# Invoice Reading Chatbot 🤖

An **intelligent web application** that extracts information from invoices (**PDFs and images**) and allows you to **chat with an AI assistant** to ask natural-language questions about your invoices.

## ✨ Features

- 📂 **Upload Invoices** – Supports **PDF, JPG, PNG** files  
- 🔍 **Text Extraction** – Automatic **OCR for images** and **PDF text parsing**  
- 🤖 **AI-Powered Chat** – Ask natural language questions about your invoices  
- 💡 **Smart Responses** – Get insights like **totals, dates, vendors, taxes, etc.**  
- 🎨 **Modern UI** – Clean, responsive interface with **dark theme** support  

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React.js** with **Vite**  
- 🎨 **Tailwind CSS** for sleek responsive UI  


### Backend
- 🟢 **Node.js** with **Express.js**  
- 🗄️ **MongoDB** with **Mongoose**  
- 📑 **pdf-parse** for PDF extraction  
- 🧠 **Tesseract.js** for OCR on images  

---
<img width="1908" height="1033" alt="Screenshot 2025-09-03 163815" src="https://github.com/user-attachments/assets/16f05dc9-d345-4e75-a6d4-5db706bb3d6d" />

<img width="1890" height="1030" alt="Screenshot 2025-09-03 171450" src="https://github.com/user-attachments/assets/36bfffb1-a060-4c25-8d84-f0f719310236" />

---

## 🚀 Installation
### Clone the Repository
```sh
git clone https://github.com/100xManas/Invoice-Reading-Chatbot.git
cd Invoice-Reading-Chatbot
```

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following environment variables.
   ```sh
   PORT=8080
   OPENAI_API_KEY=<your-api-key>
   
   ``` 
4. Start the backend server:
   ```sh
   node server.js
   ```
   The server should be running on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend application:
   ```sh
   npm run dev
   ```
   The frontend should be running on `http://localhost:5173`
   
## Contribution
Feel free to fork this repository and make pull requests. Follow these steps:
1. **Fork the repository**.
2. **Create a new branch** (`git checkout -b feature-branch`).
3. **Commit your changes** (`git commit -m "Added a new feature"`).
4. **Push to the branch** (`git push origin feature-branch`).
5. **Create a pull request**.

---
🚀 Happy Coding!

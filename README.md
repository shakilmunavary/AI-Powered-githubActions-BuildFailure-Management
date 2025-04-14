Absolutely! Here's a **structured README file** for your **AI-powered GitHub Actions tool** using **Node.js** and **Mistral AI**.

---

## **README.md**

🚀 Automate CI/CD pipeline fixes using AI! This tool analyzes failed GitHub Actions workflows, extracts error logs, sends them to Mistral AI, and automatically applies fixes to your repository—saving valuable developer time and effort.

💡 Key Benefits: ✔ Boost Efficiency – Reduce manual debugging and let AI instantly detect and resolve pipeline failures. ✔ Minimize Downtime – Accelerate deployments by preventing bottlenecks in your CI/CD workflows. ✔ Improve Code Reliability – Get precise AI-driven fixes that enhance overall code quality. ✔ Seamless Integration – Works directly with GitHub Actions, ensuring a smooth DevOps experience. ✔ Adaptive Learning – AI continuously improves, offering smarter solutions over time.

---

## **🔹 How This AI Tool Helps**
- 🛠 **Detects CI/CD pipeline failures** and fetches logs.
- 🤖 **Uses Mistral AI to analyze errors** and suggest corrections.
- 🔄 **Automatically updates workflows** with AI-generated fixes.
- 🔧 **Provides a dashboard** to monitor failures and AI suggestions.
- ⚡ **Allows environment variable updates** dynamically—no restart needed!

---

## **📥 Installation Steps**
### **1️⃣ Clone Repository**
```bash
git clone (https://github.com/shakilmunavary/ai-powered-buildFailure-management.git)
cd ai-powered-buildFailure-management
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file with:
```bash
GITHUB_TOKEN=your_github_token
REPO_OWNER=your_github_username
REPO_NAME=your_repo_name
```
Create `.env.mistral.ai` for Mistral API:
```bash
MISTRAL_API_KEY=your_mistral_api_key
```

### **4️⃣ Start the Application**
```bash
node app.js
```
Or use **nodemon**:
```bash
npx nodemon app.js
```

---

## **🖥️ Usage**
1️⃣ Visit `http://localhost:3002` to see failed GitHub Actions runs.  
2️⃣ Click **"Allow AI to Fix the Issue"** to apply automatic fixes.  
3️⃣ Update credentials via **Settings** without restarting the server.  
4️⃣ GitHub Actions workflow updates dynamically with AI-suggested corrections.

---

## **🛠 Architecture Diagram**
📌 The tool follows this workflow:
```
User Interface (index.ejs) → Backend (app.js) → GitHub Actions API → Mistral AI → Auto-Fix Pipelines
```
![image](https://github.com/user-attachments/assets/7c5b8f99-25bc-411f-ae90-96dc5a065723)

## **🛠 UI Dashboard**
<img width="944" alt="image" src="https://github.com/user-attachments/assets/2482537a-6e60-4238-a28f-43f195d711d6" />

![image](https://github.com/user-attachments/assets/cc71e18e-c61a-4d28-9fd1-940db64c300d)

---


## **👨‍💻 Contributing**
Feel free to open issues, submit PRs, or suggest improvements!



# 📷 Instagram Unfollow Non-Followers Bot

This automation script helps you unfollow Instagram profiles that aren't following you back. It leverages Playwright for browser automation and AWS for data storage.

---

## 🚀 Features

- **Automated Login**: Securely logs into your Instagram account.
- **Non-Followers Detection**: Identifies profiles not following you back.
- **Efficient Storage**: Utilizes AWS DynamoDB for handling profile data.
- **Modular Codebase**: Easy to maintain and extend.

---

## 🛠️ Files and Modules Overview

### 📂 Main Files:

- `unfollow.js`
    - Main execution script.
    - Logs into Instagram and performs unfollow operations.

- `find.js`
    - Retrieves lists of followers and following.
    - Identifies non-followers and updates AWS DynamoDB.

- `dynamodb.js`
    - CRUD operations for AWS DynamoDB.
    - Handles fetching, updating, and deleting profile data.

- `secret_manager.js`
    - Securely fetches credentials from AWS Secrets Manager.

- `config.js`
    - Manages and loads application configuration from YAML files.

---

## 📦 Installation

### 🟢 Prerequisites:
- Node.js `^22.9.0`

### 📌 Setup Steps:

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd instagram-unfollow-nonfollower
   ```

2. **Update Modal Selectors**

   Ensure these modal selectors in `config.js` match Instagram's current DOM:

| Type | Selector | Screenshot |
|------|----------|------------|
| Popup | `.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1iyjqo2.x2lwn1j.xeuugli.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1` | ![Popup Screenshot](https://github.com/user-attachments/assets/60e6fa7f-345e-4bdf-b89c-e9a6a3e9cca4) |
| Scroll | `.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6` | ![Scroll Screenshot](https://github.com/user-attachments/assets/e566082e-4fb4-45ad-b781-640c18e46f9e) |

3. **Install Dependencies**

   Clean previous installations:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   ```

   Install required packages:
   ```bash
   npm install
   ```

4. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```

---

## ▶️ Run the Script

Execute the automation with:
```bash
node index.js
```

---

## ⚠️ Caution

Use responsibly and within Instagram's Terms of Service to avoid any account restrictions.


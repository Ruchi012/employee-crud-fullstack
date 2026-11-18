# EC2 CRUD Full-Stack Application

A beginner-friendly Employee Management CRUD project:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Deployment target: Ubuntu EC2 instance

## 1. Run locally

### Database
Create a MySQL database and table by running `database/schema.sql`:

```bash
mysql -u root -p < database/schema.sql
```

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL username/password
npm install
npm run dev
```
Backend: http://localhost:5000

### Frontend
Open a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend: http://localhost:5173

## 2. Deploy on an Ubuntu EC2 instance

### A. Create and connect to EC2
1. Launch an Ubuntu Server EC2 instance.
2. In the EC2 Security Group, allow:
   - SSH TCP 22 from **your IP only**
   - Custom TCP 5173 from your IP temporarily (optional, for testing Vite)
   - Custom TCP 5000 from your IP temporarily (optional, for direct API testing)
   - HTTP TCP 80 from anywhere for a public web deployment
3. Download your key pair (`.pem`) and connect from your computer:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@EC2_PUBLIC_IP
```

### B. Install required software on EC2
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y nodejs npm mysql-server unzip
node -v
npm -v
sudo systemctl enable --now mysql
```

If the Ubuntu repository provides an old Node.js version, install a current LTS version using the official NodeSource instructions before proceeding.

### C. Upload and extract this ZIP
From your **local computer**, in the folder containing the ZIP:
```bash
scp -i your-key.pem ec2-crud-fullstack.zip ubuntu@EC2_PUBLIC_IP:/home/ubuntu/
```
On EC2:
```bash
unzip ec2-crud-fullstack.zip
cd ec2-crud-fullstack
```

### D. Configure MySQL
```bash
sudo mysql
```
At the MySQL prompt:
```sql
CREATE DATABASE employee_crud;
CREATE USER 'cruduser'@'localhost' IDENTIFIED BY 'CHANGE_THIS_TO_A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON employee_crud.* TO 'cruduser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Import the schema:
```bash
mysql -u cruduser -p employee_crud < database/schema.sql
```

### E. Configure and start backend
```bash
cd ~/ec2-crud-fullstack/backend
cp .env.example .env
nano .env
```
Set:
```env
PORT=5000
DB_HOST=localhost
DB_USER=cruduser
DB_PASSWORD=your_actual_password
DB_NAME=employee_crud
```
Then:
```bash
npm install
npm start
```
Keep this terminal open for the first test. In another SSH terminal:
```bash
curl http://localhost:5000/api/health
```
Expected response: `{"status":"ok"}`

### F. Configure and start frontend
In a second SSH terminal:
```bash
cd ~/ec2-crud-fullstack/frontend
cp .env.example .env
nano .env
```
Set `VITE_API_URL=http://EC2_PUBLIC_IP:5000/api` for a temporary direct test.
Then:
```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0
```
Open `http://EC2_PUBLIC_IP:4173` in your browser. For this temporary preview, allow TCP 4173 from your own IP in the Security Group.

## 3. Important deployment notes
- Do not expose MySQL port 3306 publicly. Keep it bound to the instance/local network.
- Do not commit `.env` files or passwords to GitHub.
- The direct-port setup above is for learning/testing. For production, serve the built frontend and proxy `/api` through Nginx on port 80/443, use HTTPS, and run the backend with a process manager such as PM2 or systemd.
- If the browser cannot reach the API, check the EC2 Security Group, `VITE_API_URL`, backend status, and CORS configuration.
- Replace `EC2_PUBLIC_IP` with your instance's actual public IPv4 address. Do not use the example text literally.

## CRUD operations
- Create employee
- Read/list employees
- Update employee
- Delete employee

API endpoints:
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

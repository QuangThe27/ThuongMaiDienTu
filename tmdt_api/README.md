Thư viện cần cài đặt
</br>
npm install express dotenv cors morgan
</br>
npm install bcryptjs
</br>
npm install joi
</br>
npm install mysql2
</br>
npm install --save-dev nodemon

</br>
Vòng đời Request của dự án
</br>
Request </br>
 ↓ </br>
Route </br>
 ↓ </br>
Middleware (auth, role, status) </br>
 ↓ </br>
Controller </br>
 ↓ </br>
Service </br>
 ↓ </br>
Repository (Model) </br>
 ↓ </br>
Service </br>
 ↓ </br>
Controller </br>
 ↓ </br>
Response </br>

Trình tự viết code </br>
1. Model (DB) </br>
2. Service (logic) </br>
3. Controller (HTTP) </br>
4. Middleware (bảo vệ) </br>
5. Route (kết nối) </br>
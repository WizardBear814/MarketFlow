# MarketFlow
Group final for ASE 220


HOW TO RUN THE PROJECT (MongoDB + Backend)

1. Clone the Repository
-----------------------
git clone <your-repo-url>
cd MarketFlow


2. Install Dependencies
-----------------------
npm install


3. Set Up Environment Variables
-------------------------------
Create a .env file in the root of your project:

touch .env

Example .env file:

PORT=3002
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.w5pz6vk.mongodb.net/marketflow?retryWrites=true&w=majority

IMPORTANT:
- Replace <username> and <password> with your MongoDB credentials
- If your password has special characters (like $), encode them:
  $ → %24
- Do NOT upload your .env file to GitHub


4. Set Up MongoDB (Cloud - Recommended)
--------------------------------------
1. Go to MongoDB Atlas
2. Create a free cluster
3. Create a database user (username + password)
4. Add your IP address to the whitelist (or allow all for testing)
5. Copy your connection string and paste it into MONGO_URI


5. Run the Server
-----------------
node server.js

You should see:
MarketFlow API running on http://localhost:3002
MongoDB connected


6. Test the API
---------------
Open your browser or Postman:

http://localhost:3002/

If needed, add this test route in server.js:

app.get('/', (req, res) => {
  res.send('API is running');
});

Then refresh the browser.


7. (If Project Has a Frontend)
------------------------------
In a new terminal:

cd client
npm install
npm start

Then open:
http://localhost:3000


8. Stop the Server
------------------
Press:
Ctrl + C


COMMON ISSUES
-------------

Cannot find module './config/db'
- Make sure config/db.js exists
- Check spelling and capitalization
- Verify the file path is correct

MongoDB connection fails
- Check username and password
- Make sure your IP is whitelisted in MongoDB Atlas
- Encode special characters in password if needed

Nothing shows in browser
- Backend usually runs on API routes (like /api)
- Make sure frontend is running separately if applicable


TECH STACK
----------
Node.js
Express
MongoDB (Atlas)
Mongoose


SUMMARY
-------
- .env stores sensitive data
- MongoDB Atlas is the database
- node server.js runs the backend
- Frontend (if included) runs separately

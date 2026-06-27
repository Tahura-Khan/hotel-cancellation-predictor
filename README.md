# Hotel Booking Cancellation Prediction & Analytics

An end-to-end Data Science and Full Stack web application that analyzes hotel booking data, provides interactive business insights, and predicts booking cancellations using Machine Learning.

The project combines **Data Analytics**, **Machine Learning**, **Flask**, **MySQL**, and **interactive dashboards** to help understand customer booking behavior and support better business decisions.

---

## 📌 Project Objectives

- Analyze hotel booking trends and customer behavior.
- Identify factors contributing to booking cancellations.
- Visualize business insights through interactive dashboards.
- Predict whether a booking is likely to be cancelled using Machine Learning.
- Provide data-driven insights to improve hotel revenue management.

---

##  Features

### Interactive Dashboard
- View raw booking data
- Pagination for large datasets
- Dynamic charts using Chart.js
- Responsive Bootstrap interface

### Use Case 1 – Booking Performance Analysis
- Monthly booking trends
- Cancellation distribution
- Average Daily Rate (ADR) analysis

### Use Case 2 – Customer Behavior Analysis
###  Machine Learning Prediction
Predicts whether a hotel booking will be cancelled based on booking details.
- Customer segmentation
- Booking channel analysis
- Market segment insights
- Customer booking patterns

###  Use Case 3 – Revenue & Business Insights
- Revenue analysis
- ADR comparison
- Booking distribution
- Business performance metrics

###  Use Case 4 – Seasonal Cancellation Insights
- Seasonal booking trends
- Monthly cancellation trends
- Peak vs Off-season analysis
- Demand type cancellation analysis
- Dynamic filtering by month and season


The prediction module includes:
- Data preprocessing
- Feature engineering
- One-hot encoding
- Model prediction
- Cancellation probability
- Feature importance-based reasoning

---

##  Technologies Used

### Backend
- Python
- Flask
- MySQL

### Frontend
- HTML5
- Bootstrap 5
- JavaScript
- Chart.js

### Machine Learning
- Scikit-learn
- Pandas
- NumPy
- Joblib

### Deployment & containerization
- Docker
  

---

## 📂 Project Structure

```
Hotel-Booking-Cancellation-Prediction/
│
|
├── backend/
│       └──templates/
|       |     └── index.html  
|       └── static/
│              ├── script
│       └── app.py
|       └──requirements.txt
|       └──Dockerfile
│       └──train_model.py
|       └──train_model_2.py
|
|
│
├── data/
│   └── hotel_bookings.csv
|   └── clean_hotel_bookings.csv
│
└── nginx/
|     └──Dockerfile
|     └──nginx.conf
```

---

## ⚙️ Project Workflow

### 1. Data Collection
- Hotel Booking Demand Dataset

### 2. Data Preprocessing
- Missing value handling
- Duplicate removal
- Feature engineering
- Encoding categorical variables
- SQL View creation for dashboard analysis

### 3. Exploratory Data Analysis
Performed detailed analysis on:
- Booking trends
- Cancellation rates
- Seasonal demand
- Revenue patterns
- Customer segments

### 4. Machine Learning
- Feature selection
- Model training
- Model evaluation
- Prediction API development
- Cancellation probability prediction

### 5. Dashboard Development
Developed an interactive dashboard with multiple analytical use cases and dynamic visualizations.

### 6. Docker support
The application was containerized using docker to ensure consistent deployment across different environments.

---

## 📊 Dashboard Modules

| Module | Description |
|---------|-------------|
| Raw Data | Displays hotel booking records with pagination |
| Use Case 1 | Booking trends, cancellation prediction\ML prediction|
| Use Case 2 | Customer behaviour and booking patterns |
| Use Case 3 | Revenue and business performance insights |
| Use Case 4 | Seasonal booking & cancellation analytics |


---

## 🤖 Machine Learning Model

The prediction model analyzes multiple booking attributes including:

- Lead Time
- Arrival Month
- Market Segment
- Deposit Type
- Customer Type
- Previous Cancellations
- Booking Changes
- Special Requests
- Average Daily Rate (ADR)
- Other engineered features

The model predicts:

- Booking Cancellation (Yes/No)
- Cancellation Probability
- Feature importance-based reasoning

---

## 📈 Business Insights Generated

- Monthly booking demand analysis
- Seasonal cancellation patterns
- Peak season booking behavior
- Average Daily Rate trends
- Customer segment analysis
- Demand type comparison
- Revenue-related insights

---

## ▶️ Running the Project

### Method 1: Using Docker (Recommended)

#### Clone the repository

```bash
git clone https://github.com/yourusername/hotel-booking-cancellation-prediction.git
cd hotel-booking-cancellation-prediction
```

#### Build and start the application

```bash
need to build each image indidually
docker build -t flask_image  .
etc
```

The application will be available at:

```
http://localhost:5000
```

---

### Method 2: Run Without Docker

Install dependencies:

```bash
pip install -r requirements.txt
```

Update the MySQL database credentials in `app.py`.

Run the application:

```bash
python app.py
```

Open your browser:

```
http://127.0.0.1:5000
```
## 🎯 Future Enhancements

- Explainable AI (SHAP)
- Cloud deployment
- User authentication
- Export reports (PDF/Excel)
- Advanced forecasting models

---

## 📚 Skills Demonstrated

- Data Cleaning
- Feature Engineering
- Exploratory Data Analysis
- Machine Learning
- Model Deployment
- Flask Development
- REST API Development
- SQL & Database Management
- Dashboard Development
- Data Visualization
- Business Intelligence
- Docker
- Full Stack Development

---

## 👩‍💻 Author

**Tahura Tazeen Khanam**

Data Science & AI/ML Enthusiast passionate about building end-to-end machine learning applications, interactive dashboards, and data-driven solutions.

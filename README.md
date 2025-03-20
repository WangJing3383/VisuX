# Visux - Data Visualisation and Dimensionality Reduction Engine

## Overview
Visux is a web-based tool designed to provide users with interactive visualization and advanced techniques for their datasets.

## Features
- **File Upload & Download**: Supports CSV, Excel, and JSON formats.
- **Data Visualisation**: Provides multiple chart types, including scatter plots, line charts, bar charts, pie charts, heatmaps, and 3D visualizations using **Plotly.js**.
- **Dimensionality Reduction**: Supports **PCA, t-SNE, and UMAP** for feature reduction.
- **Interpolation & Extrapolation**: Applies linear, polynomial, and exponential methods to extend datasets.
- **Correlation Analysis**: Computes Pearson, Spearman, and Kendall correlations.
- **Graph Editing**: Allows customization of axes, colors, and styles.
- **Logging System**: Tracks all user actions and operations for better data management.

## Technologies Used
### Frontend
- **React.js** (Component-based UI)
- **Ant Design** (UI components)
- **Plotly.js** (Data visualisation)
- **Axios** (API communication)

### Backend
- **Django** (Web framework)
- **Django REST Framework** (API development)
- **SQLite** (Database management)
- **Pandas, NumPy** (Data manipulation)
- **Scikit-learn, SciPy** (Machine learning & statistical analysis)

## Installation
### Prerequisites
Ensure you have the following installed:
- **Node.js** & **npm** (for frontend development)
- **Python 3.8+** & **pip** (for backend development)

### Setup
#### 1. Clone the Repository
```sh
 git clone https://github.com/WangJing3383/VisuX.git
 cd Visux\my-visualization-app\
```
#### 2. Backend Setup
```sh
 cd backend
 python -m venv venv  # Create a virtual environment
 source venv/bin/activate  # Activate virtual environment (Mac/Linux)
 venv\Scripts\activate  # Activate virtual environment (Windows)
 pip install -r requirements.txt  # Install dependencies
 python manage.py migrate  # Apply database migrations
 python manage.py runserver  # Start the backend server
```
#### 3. Frontend Setup
```sh
 cd frontend
 npm install  # Install dependencies
 npm start  # Start the frontend server
```

## Usage
1. Upload a dataset through the interface.
2. Select visualization options or apply data processing tools.
3. Customize graphs using the **Graph Editor**.
4. Download processed datasets or export visualizations.


## Contributors
- **Shengjie Yin**  
- **Jing Wang**  
- **Ezgi Yircali**  
- **Yufei Lin**  
- **Mengjia Cao**  

## License
This project is licensed under the **MIT License**.

## Acknowledgments
Special thanks to our **supervisors** at the Karlsruhe Institute of Technology (KIT) for their guidance and support!
- **Gürol Saglam**  
- **Shanmukha Mangadahalli Siddaramu** 
---
⭐ If you find this project useful, consider giving it a **star** on GitHub! 🚀

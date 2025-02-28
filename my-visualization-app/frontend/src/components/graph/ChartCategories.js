import {LineChartOutlined, BarChartOutlined, PieChartOutlined, HeatMapOutlined, RadarChartOutlined, DotChartOutlined, AreaChartOutlined, AppstoreAddOutlined } from '@ant-design/icons';

// chartCategories for representing Graph Types
export const chartCategories = {
    "Basic Charts": [
      { type: "scatter", name: "Scatter Plot", icon: <DotChartOutlined />, requiredFeatures: 2 },
      { type: "line", name: "Line Chart", icon: <LineChartOutlined />, requiredFeatures: 2 },
      { type: "bar", name: "Bar Chart", icon: <BarChartOutlined />, requiredFeatures: 2 },
      { type: "area", name: "Area Chart", icon: <AreaChartOutlined />, requiredFeatures: 2 },
    ],
    "Advanced Charts": [
      { type: "pie", name: "Pie Chart", icon: <PieChartOutlined />, requiredFeatures: 1 },
      { type: "heatmap", name: "Heatmap", icon: <HeatMapOutlined />, requiredFeatures: 3 },
      { type: "scatterpolar", name: "Radar Chart", icon: <RadarChartOutlined />, requiredFeatures: 3 },
      { type: "scatter3d", name: "3D Scatter Plot", icon: <AppstoreAddOutlined />, requiredFeatures: 3 },
    ],
  };
  
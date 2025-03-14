import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import UIController from './components/UIController';
import Sidebar from './components/homepage/Sidebar';
import HeaderNav from './components/homepage/Header';
import LayoutContainer from './components/homepage/Layout';
import ModalCollection from "./components/modal/ModalCollection";

const { Header, Sider, Content } = Layout;

// Trigger an API call to empty the database
const fetchClearDatabase = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/clear_database/", {
      method: "POST",
      credentials: "include", // Make sure Django sends cookies
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Database cleared successfully.");
    } else {
      console.error("Failed to clear database.");
    }
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

const App = () => {
  useEffect(() => {
    fetchClearDatabase(); // Trigger database emptying on application initialisation
  }, []);

  const [uiController] = useState(new UIController());

  const [showGraph, setShowGraph] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showGraphEdit, setShowGraphEdit] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Fixed Header */}
      <Header style={{
        background: '#fff',
        color: '#000',
        padding: '0 20px',
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <HeaderNav uiController={uiController} />
      </Header>

      <Layout style={{ marginTop: 54 }}>
        {/* Fixed Sidebar */}
        <Sider width={220} style={{
          background: '#fff',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 64,
          zIndex: 999,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Sidebar uiController={uiController}
            showGraph={showGraph} setShowGraph={setShowGraph}
            showData={showData} setShowData={setShowData}
            showLog={showLog} setShowLog={setShowLog}
            showTable={showTable} setShowTable={setShowTable}
            showGraphEdit={showGraphEdit} setShowGraphEdit={setShowGraphEdit}
          />
        </Sider>

        {/* Content area scrollable */}
        <Layout style={{ marginLeft: 200 }}>
          <Content style={{
            overflowX: "hidden",
            overflowY: 'auto',
            height: 'calc(100vh - 64px)',
            padding: 10,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <LayoutContainer uiController={uiController}
              showGraph={showGraph}
              showData={showData}
              showLog={showLog}
              showTable={showTable}
              showGraphEdit={showGraphEdit}
            />
          </Content>
        </Layout>
      </Layout>
      <ModalCollection uiController={uiController} />
    </Layout>
  );
};

export default App;

import React, { useState } from 'react';
// import Desktop1UI from "./components/desktop1ui/Desktop1UI";
import { Layout } from 'antd';
import UIController from './components/UIController';
import Sidebar from './components/homepage/Sidebar';
import HeaderNav from './components/homepage/Header';
import LayoutContainer from './components/homepage/Layout';
import ModalCollection from "./components/modal/ModalCollection";
import { useEffect } from "react";

const { Header, Sider, Content } = Layout;

const fetchCsrfToken = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/get_csrf_token/", {
      credentials: "include", // Make sure Django sends cookies
    });
    const data = await response.json();
    // Store to localStorage for subsequent requests.
    document.cookie = `csrftoken=${data.csrfToken}; path=/;`;
    localStorage.setItem("csrfToken", data.csrfToken);

    // Pop up CSRF token in browser (debugging only)

  } catch (error) {
    console.error("Error fetching CSRF token:", error);
  }
};

const App = () => {
  useEffect(() => {
    fetchCsrfToken();
  }, []);
  const [uiController] = useState(new UIController());

  //These manage the opening and closing of the graph data log interface, where graph should be able to manage the switching on and off of all graph windows.
  const [showGraph, setShowGraph] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showGraphEdit, setShowGraphEdit] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Fixed Header */}
      <Header style={{ background: '#fff', color: '#000', padding: '0 20px', position: 'fixed', width: '100%', zIndex: 1000, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <HeaderNav uiController={uiController}/>
      </Header>

      <Layout style={{ marginTop: 54 }}>
        {/* Fixed Sidebar */}
        <Sider width={220} style={{ background: '#fff', position: 'fixed', height: '100vh', left: 0, top: 64, zIndex: 999, boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)' }}>
          <Sidebar uiController={uiController}
            showGraph={showGraph} setShowGraph={setShowGraph}
            showData={showData} setShowData={setShowData}
            showLog={showLog} setShowLog={setShowLog}
            showTable={showTable} setShowTable={setShowTable}
            showGraphEdit={showGraphEdit} setShowGraphEdit={setShowGraphEdit}
          />
        </Sider>

        {/* Content scrollable */}
        <Layout style={{ marginLeft: 200 }}>
          <Content style={{
              overflowX: "hidden",
              overflowY: 'auto',
              height: 'calc(100vh - 64px)',
              padding: 10,
              display: 'flex',
              flexDirection: 'column' }}>
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

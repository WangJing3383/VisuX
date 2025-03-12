import React from 'react';
import { Layout } from 'antd';
import FileComponent from "../file/FileComponent";

const { Header } = Layout;

const HeaderNav = ({ uiController }) => {
  return (
      <Header data-testid="header-nav" style={{background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between'}}>
          <div data-testid="header-title" style={{margin: '-20px'}}>
              <h2>Visux</h2>
          </div>
          <div  data-testid="file-component-container" style={{marginLeft: "auto"}}>
              <FileComponent uiController={uiController}/>
          </div>
      </Header>
  );
};

export default HeaderNav;

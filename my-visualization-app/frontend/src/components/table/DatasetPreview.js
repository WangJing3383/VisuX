// import React from 'react';
// import { Table } from 'antd';

// const DatasetPreview = ({ dataset }) => {
//   if (!dataset || dataset.length === 0) {
//     return <p>No dataset available.</p>;
//   }

//   const columns = Object.keys(dataset[0]).map(key => ({
//     title: key,
//     dataIndex: key,
//     key: key,
//   }));

//   return (
//     <Table
//       dataSource={dataset.map((item, index) => ({ ...item, key: index }))}
//       columns={columns}
//       pagination={{ pageSize: 5 }}
//     />
//   );
// };

// export default DatasetPreview;

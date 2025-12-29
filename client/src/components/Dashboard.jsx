import React from 'react';
import styled from 'styled-components';
import DrawingCanvas from './DrawingCanvas'; // Mudou para ./ (mesma pasta)
import GlobalChat from './GlobalChat';       // Mudou para ./ (mesma pasta)

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  height: 100vh;
  background-color: #1a1a1a;
`;

const Dashboard = () => {
  const user = { id: 1, nome: "Utilizador", cargo: "Professor" };

  return (
    <Layout>
      <section style={{ padding: '20px' }}>
        <DrawingCanvas />
      </section>
      <aside style={{ borderLeft: '1px solid #333' }}>
        <GlobalChat salaId="sala_01" user={user} />
      </aside>
    </Layout>
  );
};

export default Dashboard;
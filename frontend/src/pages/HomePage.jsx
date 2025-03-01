import React from "react";
import Home from "../Components/Home/Home";

const HomePage = () => {
  return (
    <main
      className="home-container w-screen min-h-screen flex flex-col"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Home />
      
    </main>
  );
};

export default HomePage;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AppBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const tokenExpiry = localStorage.getItem("token_expiry");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (token && tokenExpiry && Date.now() > Number(tokenExpiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
      navigate("/login");
    }
  }, [token, tokenExpiry, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    navigate("/login");
  };

  const styles = {
    appbar: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      background: "linear-gradient(90deg,rgb(208, 192, 192) 0%,rgb(230, 11, 11) 100%)",
      color: "white",
      padding: "0 16px",
      height: "64px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    },
    logo: {
      display: "flex",
      alignItems: "center"
    },
    logoImg: {
      height: "50px",
      marginRight: "8px"
    },
    nav: {
      display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
      flexDirection: isMobile ? "column" : "row",
      position: isMobile ? "absolute" : "static",
      top: "64px",
      zIndex: 1000,
      left: 0,
      width: "100%",
      background: isMobile ? "rgb(181, 46, 46)" : "transparent",
      padding: isMobile ? "10px 0" : 0,
      alignItems: isMobile ? "flex-start" : "center",
      gap: "12px"
    },
    navLink: {
      color: "white",
      textDecoration: "none",
      fontSize: "1rem",
      padding: "8px 16px",
      width: isMobile ? "100%" : "auto",
      display: "block",
      boxSizing: "border-box"
    },
    btn: {
      background: "white",
      color: "#1976d2",
      border: "none",
      borderRadius: "20px",
      padding: "8px 16px",
      fontWeight: 500,
      cursor: "pointer",
      marginLeft: isMobile ? 0 : "16px",
      width: isMobile ? "100%" : "auto"
    },
    hamburger: {
      display: isMobile ? "block" : "none",
      fontSize: "35px",
      cursor: "pointer",
      color: "white",
      padding: "16px",
      marginRight: "16px"
    }
  };

  return (
    <>
      <header style={styles.appbar}>
        <div style={styles.logo}>
          <img style={styles.logoImg} src="https://res.cloudinary.com/drbjrsm0s/image/upload/v1745463450/logo_ulbaie.png" alt="Logo" />
        </div>
        <div style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
        {!isMobile && (
          <nav style={styles.nav}>
            <Link to="/units" style={styles.navLink}>Quản lý Đơn vị</Link>
            <Link to="/products" style={styles.navLink}>Thêm Sản Phẩm</Link>
            <Link to="/solutions" style={styles.navLink}>Thêm Biện Pháp</Link>
            <Link to="/statuses" style={styles.navLink}>Thêm Tình Trạng</Link>
            <Link to="/catecar" style={styles.navLink}>Thêm Loại Xe</Link>
            <Link to="/repair-contents" style={styles.navLink}>Nội dung sửa chữa</Link>
            <Link to="/cars" style={styles.navLink}>Thêm Xe</Link>
            {token && (
              <button style={styles.btn} onClick={handleLogout}>Đăng xuất</button>
            )}
          </nav>
        )}
      </header>

      {isMobile && menuOpen && (
        <nav style={styles.nav}>
          <Link to="/units" style={styles.navLink} onClick={() => setMenuOpen(false)}>Quản lý Đơn vị</Link>
          <Link to="/products" style={styles.navLink} onClick={() => setMenuOpen(false)}>Thêm Sản Phẩm</Link>
          <Link to="/solutions" style={styles.navLink} onClick={() => setMenuOpen(false)}>Thêm Biện Pháp</Link>
          <Link to="/statuses" style={styles.navLink} onClick={() => setMenuOpen(false)}>Thêm Tình Trạng</Link>
          <Link to="/catecar" style={styles.navLink} onClick={() => setMenuOpen(false)}>Thêm Loại Xe</Link>
          <Link to="/repair-contents" style={styles.navLink} onClick={() => setMenuOpen(false)}>Nội dung sửa chữa</Link>
          <Link to="/cars" style={styles.navLink} onClick={() => setMenuOpen(false)}>Thêm Xe</Link>
          {token && (
            <button style={styles.btn} onClick={handleLogout}>Đăng xuất</button>
          )}
        </nav>
      )}
    </>
  );
};

export default AppBar;

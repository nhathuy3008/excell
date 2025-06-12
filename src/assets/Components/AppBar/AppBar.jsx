import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = {
  appbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(90deg,rgb(208, 192, 192) 0%,rgb(230, 11, 11) 100%)",
    color: "white",
    padding: "0 32px",
    height: "64px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  logoImg: {
    height: "40px",
    marginRight: "8px"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    letterSpacing: "1px",
    whiteSpace: "nowrap"
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%"
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    transition: "opacity 0.2s",
    whiteSpace: "nowrap"
  },
  btn: {
    background: "white",
    color: "#1976d2",
    border: "none",
    borderRadius: "20px",
    padding: "8px 20px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s"
  }
};

const AppBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const tokenExpiry = localStorage.getItem("token_expiry");

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

  return (
    <header style={styles.appbar}>
      <div style={styles.logo}>
        <img style={styles.logoImg} src="https://res.cloudinary.com/drbjrsm0s/image/upload/v1745463450/logo_ulbaie.png" alt="Logo" />
        <span style={styles.title}>Bá Thành</span>
      </div>
      <div style={styles.nav}>
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
      </div>
    </header>
  );
};

export default AppBar;

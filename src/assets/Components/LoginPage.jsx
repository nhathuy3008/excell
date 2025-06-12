import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginAccount, forgotPassword, resetPassword } from "../api/accountApi";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mã code, 3: nhập mật khẩu mới
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/cars");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAccount(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token_expiry", Date.now() + 60 * 60 * 1000);
      navigate("/cars");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await forgotPassword({ email: forgotPasswordEmail });
      setMessage("Mã xác thực đã được gửi đến email của bạn");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi mã xác thực");
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword({
        email: forgotPasswordEmail,
        code: resetCode,
        newPassword: newPassword
      });
      setMessage("Đặt lại mật khẩu thành công");
      setIsModalOpen(false);
      setStep(1);
      setForgotPasswordEmail("");
      setResetCode("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt lại mật khẩu");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="login-container">
          <div className="login-box">
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  name="email" 
                  placeholder="Email" 
                  onChange={handleChange} 
                  required 
                  className="login-input"
                />
              </div>
              <div className="input-group">
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Mật khẩu" 
                  onChange={handleChange} 
                  required 
                  className="login-input"
                />
              </div>
              <div className="forgot-password">
                <a href="#" onClick={() => setIsModalOpen(true)}>Quên mật khẩu?</a>
              </div>
              <button type="submit" className="login-button">Đăng nhập</button>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{step === 1 ? "Quên mật khẩu" : step === 2 ? "Nhập mã xác thực" : "Đặt lại mật khẩu"}</h3>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            
            {step === 1 && (
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="login-input"
                />
                <button onClick={handleForgotPassword} className="login-button">Gửi mã xác thực</button>
              </div>
            )}

            {step === 2 && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nhập mã xác thực"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="login-input"
                />
                <button onClick={() => setStep(3)} className="login-button">Tiếp tục</button>
              </div>
            )}

            {step === 3 && (
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="login-input"
                />
                <button onClick={handleResetPassword} className="login-button">Đặt lại mật khẩu</button>
              </div>
            )}

            <button className="close-button" onClick={() => {
              setIsModalOpen(false);
              setStep(1);
              setError("");
              setMessage("");
            }}>×</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #f5f5f5;
        }

        .page-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          padding-top: 84px;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-box {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          width: 100%;
        }

        h2 {
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
          font-size: 1.8rem;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .login-input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .login-input:focus {
          border-color: #4a90e2;
          outline: none;
          box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
        }

        .login-button {
          width: 100%;
          padding: 0.8rem;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .login-button:hover {
          background-color: #357abd;
        }

        .error-message {
          color: #dc3545;
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .forgot-password {
          text-align: right;
          margin-bottom: 1rem;
        }

        .forgot-password a {
          color: #4a90e2;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-password a:hover {
          text-decoration: underline;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          position: relative;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }

        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 5px;
        }

        .close-button:hover {
          color: #333;
        }

        .success-message {
          color: #28a745;
          text-align: center;
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        h3 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

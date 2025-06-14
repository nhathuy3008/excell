import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from 'styled-components';
import { loginAccount, forgotPassword, resetPassword } from "../api/accountApi";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f0f2f5;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    box-sizing: border-box;

    @media (max-width: 480px) {
      padding: 0;
    }
  }
`;

const LoginContainer = styled.div`
  background: #ffffff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 550px;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 100%;  
    padding: 30px 50px;
  }
`;

const Title = styled.h2`
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 45px; /* Ensure button height is consistent */

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #0056b3;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ForgotPasswordLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  margin-top: 15px;
  display: inline-block;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 14px;
  margin-top: 10px;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 22px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 450px;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 25px 20px;
  }
`;

const CloseButton = styled(Button)`
  background-color: #6c757d;
  margin-top: 20px;

  &:hover {
    background-color: #5a6268;
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/cars";
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await loginAccount(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token_expiry", Date.now() + 60 * 60 * 1000);
      window.location.href = "/cars";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      await forgotPassword({ email: forgotPasswordEmail });
      setMessage("Mã xác thực đã được gửi đến email của bạn");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi mã xác thực");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      await resetPassword({
        email: forgotPasswordEmail,
        code: resetCode,
        newPassword: newPassword,
      });
      setMessage("Đặt lại mật khẩu thành công");
      setTimeout(() => {
        setIsModalOpen(false);
        setStep(1);
        setForgotPasswordEmail("");
        setResetCode("");
        setNewPassword("");
        setMessage("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
    setError("");
    setMessage("");
    setStep(1);
  }

  return (
    <>
      <GlobalStyle />
      <LoginContainer>
        <Title>Đăng nhập</Title>
        <Form onSubmit={handleSubmit}>
          <Input name="email" placeholder="Email" onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} required />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Đăng nhập"}
          </Button>
        </Form>
        <ForgotPasswordLink href="#" onClick={openModal}>Quên mật khẩu?</ForgotPasswordLink>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginContainer>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{step === 1 ? "Quên mật khẩu" : step === 2 ? "Nhập mã xác thực" : "Đặt lại mật khẩu"}</ModalTitle>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            {step === 1 && (
              <>
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
                <Button onClick={handleForgotPassword} disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Gửi mã xác thực"}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  type="text"
                  placeholder="Nhập mã xác thực"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />
                <Button onClick={() => setStep(3)}>Tiếp tục</Button>
              </>
            )}

            {step === 3 && (
              <>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button onClick={handleResetPassword} disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Đặt lại mật khẩu"}
                </Button>
              </>
            )}

            <CloseButton onClick={() => setIsModalOpen(false)}>Đóng</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default LoginPage;

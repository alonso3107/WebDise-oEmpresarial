"""Controlador de autenticación simulado para desarrollo local."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    """
    Endpoint de inicio de sesión. Valida estrictamente las credenciales de
    desarrollo local: username == 'user' y password == 'admin'.
    """
    username_limpio = data.username.strip()
    password_limpio = data.password.strip()

    if username_limpio == "user" and password_limpio == "admin":
        return {
            "access_token": f"token-simulado-desarrollo-boticavr-2026-{username_limpio}",
            "token_type": "bearer",
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuario o contraseña incorrectos",
    )


@router.post("/logout")
def logout():
    """Endpoint de cierre de sesión."""
    return {"message": "Sesión cerrada correctamente"}

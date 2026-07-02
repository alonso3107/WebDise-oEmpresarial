"""Controlador HTTP del punto de venta."""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.application.errors import ErrorAplicacion
from app.application.ventas.service import (
    ConfiguracionFidelidad,
    ItemVentaEntrada,
    ServicioVentas,
)
from app.core.config import settings
from app.deps import get_db
from app.infrastructure.repositories.ventas_repository import RepositorioVentasSqlAlchemy
from app.schemas.venta import VentaCreate, VentaListResponse, VentaResponse

router = APIRouter()


def _servicio(db: Session) -> ServicioVentas:
    return ServicioVentas(
        RepositorioVentasSqlAlchemy(db),
        ConfiguracionFidelidad(
            minimo_compras=settings.FIDELIDAD_MIN_COMPRAS,
            minimo_monto=settings.FIDELIDAD_MIN_MONTO,
            descuento_maximo=settings.DESCUENTO_MAX_PORCENTAJE,
        ),
    )


def _convertir_error(error: ErrorAplicacion):
    raise HTTPException(status_code=error.codigo_http, detail=str(error)) from error


@router.post("/", response_model=VentaResponse, status_code=201)
def registrar_venta(data: VentaCreate, db: Session = Depends(get_db)):
    try:
        return _servicio(db).registrar(
            items=[ItemVentaEntrada(item.producto_id, item.cantidad) for item in data.items],
            cliente_id=data.cliente_id,
            tipo_comprobante=data.tipo_comprobante,
            metodo_pago=data.metodo_pago,
        )
    except ErrorAplicacion as error:
        _convertir_error(error)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Error interno al registrar la venta") from error


@router.get("/", response_model=List[VentaListResponse])
def listar_ventas(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    estado: Optional[str] = None,
    metodo_pago: Optional[str] = None,
    fecha: Optional[date] = None,
    cliente_id: Optional[int] = None,
):
    return _servicio(db).listar(
        skip=skip,
        limit=limit,
        estado=estado,
        metodo_pago=metodo_pago,
        fecha=fecha,
        cliente_id=cliente_id,
    )


@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(venta_id: int, db: Session = Depends(get_db)):
    try:
        return _servicio(db).obtener(venta_id)
    except ErrorAplicacion as error:
        _convertir_error(error)


@router.put("/{venta_id}/anular", response_model=VentaResponse)
def anular_venta(venta_id: int, db: Session = Depends(get_db)):
    try:
        return _servicio(db).anular(venta_id)
    except ErrorAplicacion as error:
        _convertir_error(error)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Error interno al anular la venta") from error

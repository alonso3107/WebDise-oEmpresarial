"""Controladores HTTP de reportes y tablero."""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.application.errors import ErrorAplicacion
from app.application.reportes.service import ServicioReportes
from app.deps import get_db
from app.infrastructure.repositories.reportes_repository import RepositorioReportesSqlAlchemy
from app.schemas.reporte import (
    DashboardKPIs,
    IngresoCategoria,
    ProductoMasVendido,
    ProductoRotacion,
    ResumenReporte,
    VentaDiaria,
)

router = APIRouter()


def _servicio(db: Session) -> ServicioReportes:
    return ServicioReportes(RepositorioReportesSqlAlchemy(db))


def _convertir_error(error: ErrorAplicacion):
    raise HTTPException(status_code=error.codigo_http, detail=str(error)) from error


@router.get("/ventas-diarias", response_model=List[VentaDiaria])
def reporte_ventas_diarias(
    dias: int = Query(7, ge=1, le=366),
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    try:
        return _servicio(db).ventas_diarias(dias, desde, hasta)
    except ErrorAplicacion as error:
        _convertir_error(error)


@router.get("/productos-mas-vendidos", response_model=List[ProductoMasVendido])
def reporte_productos_mas_vendidos(
    limit: int = Query(10, ge=1, le=100),
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    try:
        return _servicio(db).productos_mas_vendidos(limit, desde, hasta)
    except ErrorAplicacion as error:
        _convertir_error(error)


@router.get("/ingresos-por-categoria", response_model=List[IngresoCategoria])
def ingresos_por_categoria(
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    try:
        return _servicio(db).ingresos_por_categoria(desde, hasta)
    except ErrorAplicacion as error:
        _convertir_error(error)


@router.get("/resumen", response_model=ResumenReporte)
def resumen_reporte(
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    try:
        return _servicio(db).resumen(desde, hasta)
    except ErrorAplicacion as error:
        _convertir_error(error)


@router.get("/rotacion-inventario", response_model=List[ProductoRotacion])
def reporte_rotacion_inventario(db: Session = Depends(get_db)):
    return _servicio(db).rotacion_inventario()


@router.get("/dashboard", response_model=DashboardKPIs)
def dashboard_kpis(db: Session = Depends(get_db)):
    return _servicio(db).dashboard()

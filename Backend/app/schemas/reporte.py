"""Schemas Pydantic para Reportes y KPIs."""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class VentaDiaria(BaseModel):
    fecha: str
    total_ventas: float


class ProductoMasVendido(BaseModel):
    producto_id: int
    nombre: str
    cantidad_vendida: int
    total_recaudado: float


class ProductoRotacion(BaseModel):
    producto_id: int
    nombre: str
    categoria: str
    stock_actual: int
    unidades_vendidas: int
    indice_rotacion: float


class DashboardKPIs(BaseModel):
    ventas_hoy: float
    alertas_vencimiento_pendientes: int
    alertas_stock_pendientes: int
    productos_mas_vendidos: List[ProductoMasVendido]


class IngresoCategoria(BaseModel):
    categoria: str
    ingresos: float


class ResumenReporte(BaseModel):
    ingresos_totales: float
    ventas_totales: int
    ticket_promedio: float
    producto_top: str

"""Consultas SQLAlchemy optimizadas para reportes."""

from datetime import date, datetime
from typing import Optional

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.detalle_venta import DetalleVenta
from app.models.producto import Producto
from app.models.venta import Venta


class RepositorioReportesSqlAlchemy:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _ventas_completadas(query, inicio, fin):
        query = query.filter(Venta.estado == "completada")
        if inicio:
            query = query.filter(Venta.fecha_hora >= inicio)
        if fin:
            query = query.filter(Venta.fecha_hora <= fin)
        return query

    def ventas_diarias(self, inicio: datetime, fin: datetime):
        return self.db.query(
            func.date(Venta.fecha_hora).label("fecha"),
            func.sum(Venta.monto_total).label("total"),
        ).filter(
            Venta.estado == "completada",
            Venta.fecha_hora >= inicio,
            Venta.fecha_hora <= fin,
        ).group_by(func.date(Venta.fecha_hora)).order_by(
            func.date(Venta.fecha_hora).desc()
        ).all()

    def productos_mas_vendidos(self, limit: int, inicio=None, fin=None):
        query = self.db.query(
            Producto.id,
            Producto.nombre,
            func.sum(DetalleVenta.cantidad).label("cantidad_vendida"),
            func.sum(DetalleVenta.subtotal).label("total_recaudado"),
        ).join(DetalleVenta, DetalleVenta.producto_id == Producto.id).join(
            Venta, Venta.id == DetalleVenta.venta_id
        )
        return self._ventas_completadas(query, inicio, fin).group_by(
            Producto.id, Producto.nombre
        ).order_by(desc("cantidad_vendida")).limit(limit).all()

    def ingresos_por_categoria(self, inicio=None, fin=None):
        query = self.db.query(
            func.coalesce(Categoria.nombre, "Sin categoría").label("categoria"),
            func.sum(DetalleVenta.subtotal).label("ingresos"),
        ).select_from(Producto).join(
            DetalleVenta, DetalleVenta.producto_id == Producto.id
        ).join(Venta, Venta.id == DetalleVenta.venta_id).outerjoin(
            Categoria, Producto.categoria_id == Categoria.id
        )
        return self._ventas_completadas(query, inicio, fin).group_by(
            Categoria.nombre
        ).order_by(desc("ingresos")).all()

    def resumen(self, inicio=None, fin=None):
        query = self.db.query(
            func.coalesce(func.sum(Venta.monto_total), 0.0).label("ingresos"),
            func.count(Venta.id).label("ventas"),
            func.coalesce(func.avg(Venta.monto_total), 0.0).label("promedio"),
        )
        return self._ventas_completadas(query, inicio, fin).one()

    def rotacion_inventario(self):
        return self.db.query(
            Producto.id,
            Producto.nombre,
            Producto.stock,
            Categoria.nombre.label("categoria_nombre"),
            func.sum(DetalleVenta.cantidad).label("vendidas"),
        ).outerjoin(Categoria, Producto.categoria_id == Categoria.id).outerjoin(
            DetalleVenta, DetalleVenta.producto_id == Producto.id
        ).outerjoin(
            Venta,
            (Venta.id == DetalleVenta.venta_id) & (Venta.estado == "completada"),
        ).group_by(
            Producto.id, Producto.nombre, Producto.stock, Categoria.nombre
        ).all()

    def total_ventas(self, inicio: datetime, fin: datetime) -> float:
        return self.db.query(func.coalesce(func.sum(Venta.monto_total), 0.0)).filter(
            Venta.estado == "completada",
            Venta.fecha_hora >= inicio,
            Venta.fecha_hora <= fin,
        ).scalar()

    def alertas_vencimiento(self, fecha_limite: date) -> int:
        return self.db.query(func.count(Producto.id)).filter(
            Producto.activo.is_(True),
            Producto.fecha_vencimiento.is_not(None),
            Producto.fecha_vencimiento <= fecha_limite,
        ).scalar()

    def alertas_stock(self) -> int:
        return self.db.query(func.count(Producto.id)).filter(
            Producto.activo.is_(True),
            Producto.stock <= Producto.stock_minimo,
        ).scalar()


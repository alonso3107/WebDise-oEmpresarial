from typing import List, Optional
from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.deps import get_db
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.schemas.reporte import (
    VentaDiaria,
    ProductoMasVendido,
    ProductoRotacion,
    DashboardKPIs,
    IngresoCategoria,
    ResumenReporte,
)

router = APIRouter()


def _rango_fechas(desde: Optional[date], hasta: Optional[date]):
    if desde and hasta and desde > hasta:
        raise HTTPException(status_code=400, detail="La fecha inicial no puede ser posterior a la final")
    inicio = datetime.combine(desde, datetime.min.time()) if desde else None
    fin = datetime.combine(hasta, datetime.max.time()) if hasta else None
    return inicio, fin


def _filtrar_ventas(query, desde: Optional[date], hasta: Optional[date]):
    inicio, fin = _rango_fechas(desde, hasta)
    query = query.filter(Venta.estado == "completada")
    if inicio:
        query = query.filter(Venta.fecha_hora >= inicio)
    if fin:
        query = query.filter(Venta.fecha_hora <= fin)
    return query

@router.get("/ventas-diarias", response_model=List[VentaDiaria])
def reporte_ventas_diarias(
    dias: int = Query(7, ge=1, le=366),
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """Total de ventas por día en los últimos N días."""
    fecha_fin = hasta or date.today()
    fecha_inicio = desde or (fecha_fin - timedelta(days=dias - 1))
    _rango_fechas(fecha_inicio, fecha_fin)
    
    # En SQLite date() castea datetime a date
    resultados = db.query(
        func.date(Venta.fecha_hora).label("fecha"),
        func.sum(Venta.monto_total).label("total")
    ).filter(
        Venta.estado == "completada",
        Venta.fecha_hora >= datetime.combine(fecha_inicio, datetime.min.time()),
        Venta.fecha_hora <= datetime.combine(fecha_fin, datetime.max.time()),
    ).group_by(
        func.date(Venta.fecha_hora)
    ).order_by(
        func.date(Venta.fecha_hora).desc()
    ).all()
    
    return [VentaDiaria(fecha=str(r.fecha), total_ventas=round(r.total or 0.0, 2)) for r in resultados]


@router.get("/productos-mas-vendidos", response_model=List[ProductoMasVendido])
def reporte_productos_mas_vendidos(
    limit: int = Query(10, ge=1, le=100),
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """Top N productos más vendidos en el tiempo (histórico)."""
    query = db.query(
        Producto.id,
        Producto.nombre,
        func.sum(DetalleVenta.cantidad).label("cantidad_vendida"),
        func.sum(DetalleVenta.subtotal).label("total_recaudado")
    ).join(DetalleVenta, DetalleVenta.producto_id == Producto.id)\
     .join(Venta, Venta.id == DetalleVenta.venta_id)
    query = _filtrar_ventas(query, desde, hasta)
    resultados = query\
     .group_by(Producto.id, Producto.nombre)\
     .order_by(desc("cantidad_vendida"))\
     .limit(limit).all()
     
    return [
        ProductoMasVendido(
            producto_id=r.id,
            nombre=r.nombre,
            cantidad_vendida=r.cantidad_vendida or 0,
            total_recaudado=r.total_recaudado or 0.0
        ) for r in resultados
    ]


@router.get("/ingresos-por-categoria", response_model=List[IngresoCategoria])
def ingresos_por_categoria(
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        func.coalesce(Categoria.nombre, "Sin categoría").label("categoria"),
        func.sum(DetalleVenta.subtotal).label("ingresos"),
    ).select_from(Producto)\
     .join(DetalleVenta, DetalleVenta.producto_id == Producto.id)\
     .join(Venta, Venta.id == DetalleVenta.venta_id)\
     .outerjoin(Categoria, Producto.categoria_id == Categoria.id)
    query = _filtrar_ventas(query, desde, hasta)
    resultados = query.group_by(Categoria.nombre).order_by(desc("ingresos")).all()
    return [
        IngresoCategoria(categoria=r.categoria, ingresos=round(r.ingresos or 0.0, 2))
        for r in resultados
    ]


@router.get("/resumen", response_model=ResumenReporte)
def resumen_reporte(
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        func.coalesce(func.sum(Venta.monto_total), 0.0).label("ingresos"),
        func.count(Venta.id).label("ventas"),
        func.coalesce(func.avg(Venta.monto_total), 0.0).label("promedio"),
    )
    totales = _filtrar_ventas(query, desde, hasta).one()
    top = reporte_productos_mas_vendidos(limit=1, desde=desde, hasta=hasta, db=db)
    return ResumenReporte(
        ingresos_totales=round(totales.ingresos, 2),
        ventas_totales=totales.ventas,
        ticket_promedio=round(totales.promedio, 2),
        producto_top=top[0].nombre if top else "Sin ventas",
    )


@router.get("/rotacion-inventario", response_model=List[ProductoRotacion])
def reporte_rotacion_inventario(db: Session = Depends(get_db)):
    """
    Índice de rotación por categoría y producto.
    Calculado como: (Unidades Vendidas) / (Unidades Vendidas + Stock Actual)
    """
    resultados = db.query(
        Producto.id,
        Producto.nombre,
        Producto.stock,
        Categoria.nombre.label("categoria_nombre"),
        func.sum(DetalleVenta.cantidad).label("vendidas")
    ).outerjoin(Categoria, Producto.categoria_id == Categoria.id)\
     .outerjoin(DetalleVenta, DetalleVenta.producto_id == Producto.id)\
     .outerjoin(Venta, (Venta.id == DetalleVenta.venta_id) & (Venta.estado == "completada"))\
     .group_by(Producto.id, Producto.nombre, Producto.stock, Categoria.nombre).all()
     
    respuesta = []
    for r in resultados:
        vendidas = r.vendidas or 0
        stock = r.stock or 0
        
        if vendidas + stock > 0:
            rotacion = vendidas / (vendidas + stock)
        else:
            rotacion = 0.0
            
        respuesta.append(ProductoRotacion(
            producto_id=r.id,
            nombre=r.nombre,
            categoria=r.categoria_nombre or "Sin Categoría",
            stock_actual=stock,
            unidades_vendidas=vendidas,
            indice_rotacion=round(rotacion, 4)
        ))
        
    # Ordenar por mayor rotación
    respuesta.sort(key=lambda x: x.indice_rotacion, reverse=True)
    return respuesta


@router.get("/dashboard", response_model=DashboardKPIs)
def dashboard_kpis(db: Session = Depends(get_db)):
    """KPIs consolidados para la pantalla principal."""
    hoy = date.today()
    inicio_hoy = datetime.combine(hoy, datetime.min.time())
    fin_hoy = datetime.combine(hoy, datetime.max.time())
    
    # 1. Ventas de Hoy
    ventas_hoy = db.query(func.sum(Venta.monto_total)).filter(
        Venta.estado == "completada",
        Venta.fecha_hora >= inicio_hoy,
        Venta.fecha_hora <= fin_hoy
    ).scalar() or 0.0
    
    # 2. Alertas Vencimiento (3 meses o menos)
    fecha_limite_venc = hoy + timedelta(days=90)
    alertas_venc = db.query(func.count(Producto.id)).filter(
        Producto.activo == True,
        Producto.fecha_vencimiento != None,
        Producto.fecha_vencimiento <= fecha_limite_venc
    ).scalar() or 0
    
    # 3. Alertas Stock
    alertas_stock = db.query(func.count(Producto.id)).filter(
        Producto.activo == True,
        Producto.stock <= Producto.stock_minimo
    ).scalar() or 0
    
    # 4. Top 5 Productos
    top_productos = reporte_productos_mas_vendidos(limit=5, db=db)
    
    return DashboardKPIs(
        ventas_hoy=round(ventas_hoy, 2),
        alertas_vencimiento_pendientes=alertas_venc,
        alertas_stock_pendientes=alertas_stock,
        productos_mas_vendidos=top_productos
    )

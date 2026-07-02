"""Reglas de aplicación para reportes y tablero."""

from datetime import date, datetime, timedelta
from typing import Optional

from app.application.errors import ReglaNegocioInvalida


class ServicioReportes:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ventas_diarias(
        self,
        dias: int,
        desde: Optional[date],
        hasta: Optional[date],
    ):
        fecha_fin = hasta or date.today()
        fecha_inicio = desde or (fecha_fin - timedelta(days=dias - 1))
        inicio, fin = self._rango(fecha_inicio, fecha_fin)
        return [
            {"fecha": str(fila.fecha), "total_ventas": round(fila.total or 0.0, 2)}
            for fila in self.repositorio.ventas_diarias(inicio, fin)
        ]

    def productos_mas_vendidos(
        self,
        limit: int,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
    ):
        inicio, fin = self._rango(desde, hasta)
        return [
            {
                "producto_id": fila.id,
                "nombre": fila.nombre,
                "cantidad_vendida": fila.cantidad_vendida or 0,
                "total_recaudado": round(fila.total_recaudado or 0.0, 2),
            }
            for fila in self.repositorio.productos_mas_vendidos(limit, inicio, fin)
        ]

    def ingresos_por_categoria(
        self,
        desde: Optional[date],
        hasta: Optional[date],
    ):
        inicio, fin = self._rango(desde, hasta)
        return [
            {"categoria": fila.categoria, "ingresos": round(fila.ingresos or 0.0, 2)}
            for fila in self.repositorio.ingresos_por_categoria(inicio, fin)
        ]

    def resumen(self, desde: Optional[date], hasta: Optional[date]):
        inicio, fin = self._rango(desde, hasta)
        totales = self.repositorio.resumen(inicio, fin)
        top = self.productos_mas_vendidos(1, desde, hasta)
        return {
            "ingresos_totales": round(totales.ingresos, 2),
            "ventas_totales": totales.ventas,
            "ticket_promedio": round(totales.promedio, 2),
            "producto_top": top[0]["nombre"] if top else "Sin ventas",
        }

    def rotacion_inventario(self):
        respuesta = []
        for fila in self.repositorio.rotacion_inventario():
            vendidas = fila.vendidas or 0
            stock = fila.stock or 0
            base = vendidas + stock
            respuesta.append({
                "producto_id": fila.id,
                "nombre": fila.nombre,
                "categoria": fila.categoria_nombre or "Sin categoría",
                "stock_actual": stock,
                "unidades_vendidas": vendidas,
                "indice_rotacion": round(vendidas / base, 4) if base else 0.0,
            })
        return sorted(respuesta, key=lambda item: item["indice_rotacion"], reverse=True)

    def dashboard(self):
        hoy = date.today()
        inicio, fin = self._rango(hoy, hoy)
        fecha_limite = hoy + timedelta(days=90)
        return {
            "ventas_hoy": round(self.repositorio.total_ventas(inicio, fin), 2),
            "alertas_vencimiento_pendientes": self.repositorio.alertas_vencimiento(fecha_limite),
            "alertas_stock_pendientes": self.repositorio.alertas_stock(),
            "productos_mas_vendidos": self.productos_mas_vendidos(5),
        }

    @staticmethod
    def _rango(desde: Optional[date], hasta: Optional[date]):
        if desde and hasta and desde > hasta:
            raise ReglaNegocioInvalida("La fecha inicial no puede ser posterior a la final")
        inicio = datetime.combine(desde, datetime.min.time()) if desde else None
        fin = datetime.combine(hasta, datetime.max.time()) if hasta else None
        return inicio, fin


"""Prueba de contrato del flujo que consume el frontend."""

import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.deps import get_db
from app.main import app


class IntegracionApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.session_factory = sessionmaker(bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

        def override_get_db():
            db = cls.session_factory()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def test_flujo_completo_persistido(self):
        categoria = self.client.post(
            "/api/v1/categorias/",
            json={"nombre": "Analgésicos"},
        )
        self.assertEqual(categoria.status_code, 201, categoria.text)

        producto = self.client.post(
            "/api/v1/productos/",
            json={
                "nombre": "Paracetamol 500 mg",
                "precio": 5.5,
                "stock": 10,
                "stock_minimo": 2,
                "categoria_id": categoria.json()["id"],
            },
        )
        self.assertEqual(producto.status_code, 201, producto.text)

        cliente = self.client.post(
            "/api/v1/clientes/",
            json={
                "dni": "12345678",
                "nombres": "María",
                "apellidos": "López García",
                "telefono": "987654321",
            },
        )
        self.assertEqual(cliente.status_code, 201, cliente.text)

        venta = self.client.post(
            "/api/v1/ventas/",
            json={
                "cliente_id": cliente.json()["id"],
                "metodo_pago": "efectivo",
                "items": [{"producto_id": producto.json()["id"], "cantidad": 2}],
            },
        )
        self.assertEqual(venta.status_code, 201, venta.text)
        self.assertEqual(venta.json()["monto_total"], 11.0)

        historial = self.client.get(
            "/api/v1/ventas/",
            params={"cliente_id": cliente.json()["id"]},
        )
        self.assertEqual(historial.status_code, 200, historial.text)
        self.assertEqual(historial.json()[0]["cantidad_productos"], 2)
        self.assertEqual(historial.json()[0]["cliente_nombre"], "María López García")

        resumen = self.client.get("/api/v1/reportes/resumen")
        self.assertEqual(resumen.status_code, 200, resumen.text)
        self.assertEqual(resumen.json()["ventas_totales"], 1)

        categorias = self.client.get("/api/v1/reportes/ingresos-por-categoria")
        self.assertEqual(categorias.status_code, 200, categorias.text)
        self.assertEqual(categorias.json()[0]["categoria"], "Analgésicos")
        self.assertEqual(categorias.json()[0]["ingresos"], 11.0)


if __name__ == "__main__":
    unittest.main()

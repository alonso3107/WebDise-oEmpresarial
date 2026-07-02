"""Pruebas de la inicialización idempotente de SQLite."""

import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.infrastructure.database.bootstrap import cargar_catalogo_inicial
from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.detalle_venta import DetalleVenta
from app.models.producto import Producto
from app.models.venta import Venta


class DatosInicialesTest(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.factory = sessionmaker(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

    def tearDown(self):
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()

    def test_carga_catalogo_completo_sin_duplicar(self):
        self.assertTrue(cargar_catalogo_inicial(self.factory))
        self.assertFalse(cargar_catalogo_inicial(self.factory))

        with self.factory() as db:
            self.assertEqual(db.query(Categoria).count(), 4)
            self.assertEqual(db.query(Producto).count(), 8)
            self.assertEqual(db.query(Cliente).count(), 4)
            self.assertEqual(db.query(Venta).count(), 7)
            self.assertEqual(db.query(DetalleVenta).count(), 10)


if __name__ == "__main__":
    unittest.main()

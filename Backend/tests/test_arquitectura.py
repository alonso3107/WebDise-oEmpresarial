"""Reglas simples para preservar la dirección de dependencias."""

from pathlib import Path
import unittest


class ArquitecturaTest(unittest.TestCase):
    def test_aplicacion_no_depende_de_sqlalchemy_ni_modelos_orm(self):
        raiz = Path(__file__).resolve().parents[1] / "app" / "application"
        for archivo in raiz.rglob("*.py"):
            contenido = archivo.read_text(encoding="utf-8")
            self.assertNotIn("sqlalchemy", contenido, archivo)
            self.assertNotIn("app.models", contenido, archivo)


if __name__ == "__main__":
    unittest.main()

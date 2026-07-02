"""Creación del esquema y carga inicial idempotente para desarrollo."""

from datetime import date, datetime, time, timedelta
import logging

from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, SessionLocal, engine
from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.detalle_venta import DetalleVenta
from app.models.movimiento_caja import MovimientoCaja  # noqa: F401
from app.models.pago_servicio import PagoServicio  # noqa: F401
from app.models.producto import Producto
from app.models.promocion import Promocion  # noqa: F401
from app.models.proveedor import Proveedor  # noqa: F401
from app.models.venta import Venta

logger = logging.getLogger(__name__)


def inicializar_base_datos(cargar_datos_iniciales: bool = True) -> bool:
    """Crea tablas y devuelve si se insertó el catálogo inicial."""
    Base.metadata.create_all(bind=engine)
    if not cargar_datos_iniciales:
        return False
    return cargar_catalogo_inicial(SessionLocal)


def cargar_catalogo_inicial(factory: sessionmaker) -> bool:
    """Inserta datos coherentes una sola vez cuando la base está vacía."""
    db: Session = factory()
    try:
        if _contiene_datos_operativos(db):
            return False

        categorias = _crear_categorias(db)
        productos = _crear_productos(db, categorias)
        clientes = _crear_clientes(db)
        db.flush()
        _crear_ventas(db, productos, clientes)
        db.commit()
        logger.info("Catálogo inicial de BoticaVR creado correctamente")
        return True
    except Exception:
        db.rollback()
        logger.exception("No se pudo crear el catálogo inicial")
        raise
    finally:
        db.close()


def _contiene_datos_operativos(db: Session) -> bool:
    return any(
        db.query(modelo).first() is not None
        for modelo in (Categoria, Producto, Cliente, Venta)
    )


def _crear_categorias(db: Session) -> dict[str, Categoria]:
    nombres = {
        "Medicamentos": "Medicamentos de venta libre y con receta",
        "Vitaminas": "Vitaminas y suplementos nutricionales",
        "Cuidado personal": "Higiene y cuidado diario",
        "Bebés": "Productos para el cuidado infantil",
    }
    categorias = {
        nombre: Categoria(nombre=nombre, descripcion=descripcion)
        for nombre, descripcion in nombres.items()
    }
    db.add_all(categorias.values())
    db.flush()
    return categorias


def _crear_productos(
    db: Session,
    categorias: dict[str, Categoria],
) -> dict[str, Producto]:
    hoy = date.today()
    datos = [
        ("Paracetamol 500 mg", 4.50, 42, 8, "775001000001", "Medicamentos", 540),
        ("Ibuprofeno 400 mg", 7.90, 28, 6, "775001000002", "Medicamentos", 420),
        ("Amoxicilina 500 mg", 18.50, 15, 5, "775001000003", "Medicamentos", 360),
        ("Vitamina C 1 g", 12.00, 24, 5, "775001000004", "Vitaminas", 480),
        ("Alcohol medicinal 70%", 8.50, 3, 5, "775001000005", "Cuidado personal", 720),
        ("Protector solar FPS 50", 39.90, 12, 4, "775001000006", "Cuidado personal", 600),
        ("Pañales talla M x20", 32.90, 8, 4, "775001000007", "Bebés", 900),
        ("Shampoo para bebé", 16.90, 0, 3, "775001000008", "Bebés", 780),
    ]
    productos = {
        nombre: Producto(
            nombre=nombre,
            descripcion=f"Presentación estándar de {nombre}",
            precio=precio,
            stock=stock,
            stock_minimo=stock_minimo,
            codigo_barras=codigo,
            categoria_id=categorias[categoria].id,
            fecha_vencimiento=hoy + timedelta(days=dias_vencimiento),
        )
        for nombre, precio, stock, stock_minimo, codigo, categoria, dias_vencimiento in datos
    }
    db.add_all(productos.values())
    return productos


def _crear_clientes(db: Session) -> list[Cliente]:
    clientes = [
        Cliente(dni="74125896", nombres="María", apellidos="López García", telefono="987654321"),
        Cliente(dni="70418523", nombres="Carlos", apellidos="Ruiz Mendoza", telefono="976543210"),
        Cliente(dni="76831425", nombres="Ana", apellidos="Torres Flores", telefono="965432109"),
        Cliente(dni="72589631", nombres="Pedro", apellidos="Sánchez Díaz", telefono="954321098"),
    ]
    db.add_all(clientes)
    return clientes


def _crear_ventas(
    db: Session,
    productos: dict[str, Producto],
    clientes: list[Cliente],
) -> None:
    hoy = date.today()
    operaciones = [
        (0, 0, "efectivo", [("Paracetamol 500 mg", 2), ("Vitamina C 1 g", 1)]),
        (0, 1, "yape", [("Protector solar FPS 50", 1)]),
        (1, 2, "efectivo", [("Ibuprofeno 400 mg", 2)]),
        (2, 0, "plin", [("Pañales talla M x20", 1), ("Shampoo para bebé", 1)]),
        (3, 3, "tarjeta", [("Alcohol medicinal 70%", 2), ("Paracetamol 500 mg", 1)]),
        (5, 1, "efectivo", [("Amoxicilina 500 mg", 1)]),
        (6, 2, "yape", [("Vitamina C 1 g", 2)]),
    ]

    for indice, (dias_atras, cliente_indice, metodo, items) in enumerate(operaciones):
        subtotal = sum(productos[nombre].precio * cantidad for nombre, cantidad in items)
        venta = Venta(
            cliente_id=clientes[cliente_indice].id,
            fecha_hora=datetime.combine(hoy - timedelta(days=dias_atras), time(9 + indice, 15)),
            tipo_comprobante="boleta",
            estado="completada",
            subtotal=round(subtotal, 2),
            descuento=0.0,
            monto_total=round(subtotal, 2),
            metodo_pago=metodo,
        )
        db.add(venta)
        db.flush()

        for nombre, cantidad in items:
            producto = productos[nombre]
            db.add(DetalleVenta(
                venta_id=venta.id,
                producto_id=producto.id,
                cantidad=cantidad,
                precio_unitario=producto.precio,
                subtotal=round(producto.precio * cantidad, 2),
            ))

        cliente = clientes[cliente_indice]
        cliente.total_compras += 1
        cliente.monto_acumulado = round(cliente.monto_acumulado + subtotal, 2)


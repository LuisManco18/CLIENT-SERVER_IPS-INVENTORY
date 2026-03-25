"""
Script de compilación del ITAM Agent a ejecutable .exe
Usa PyInstaller para crear un ejecutable standalone de Windows.

Uso:
    pip install pyinstaller
    python build_exe.py
"""

import subprocess
import shutil
import sys
from pathlib import Path


def build():
    # Directorio raíz del proyecto
    project_dir = Path(__file__).parent
    src_dir = project_dir / "src"
    dist_dir = project_dir / "dist"
    
    print("=" * 60)
    print("  ITAM Agent - Build Ejecutable")
    print("=" * 60)
    
    # Verificar que PyInstaller está instalado
    try:
        import PyInstaller
        print(f"[OK] PyInstaller {PyInstaller.__version__} encontrado")
    except ImportError:
        print("[FAIL] PyInstaller no está instalado.")
        print("  Ejecuta: pip install pyinstaller")
        sys.exit(1)
    
    # Comando de PyInstaller
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",                    # Un solo archivo .exe
        "--noconsole",                  # Sin ventana de consola (modo silencioso)
        "--name", "ITAMAgent",          # Nombre del ejecutable
        
        # Hidden imports necesarios para WMI y pywin32
        "--hidden-import", "wmi",
        "--hidden-import", "pythoncom",
        "--hidden-import", "pywintypes",
        "--hidden-import", "win32com",
        "--hidden-import", "win32com.client",
        "--hidden-import", "win32api",
        "--hidden-import", "win32timezone",
        
        # Directorio de trabajo y salida
        "--distpath", str(dist_dir),
        "--workpath", str(project_dir / "build"),
        "--specpath", str(project_dir),
        
        # Archivo principal
        str(src_dir / "main.py"),
    ]
    
    print(f"\nCompilando...")
    print(f"  Entrada: {src_dir / 'main.py'}")
    print(f"  Salida:  {dist_dir / 'ITAMAgent.exe'}")
    print()
    
    # Ejecutar PyInstaller
    result = subprocess.run(cmd, cwd=str(project_dir))
    
    if result.returncode != 0:
        print("\n[FAIL] Error durante la compilación")
        sys.exit(1)
    
    # Copiar config.json junto al ejecutable
    config_src = project_dir / "config.json.example"
    config_dst = dist_dir / "config.json"
    
    if config_dst.exists():
        config_dst.unlink()
    
    shutil.copy2(config_src, config_dst)
    print(f"\n[OK] config.json copiado a {config_dst}")
    
    # Resumen
    exe_path = dist_dir / "ITAMAgent.exe"
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print()
        print("=" * 60)
        print("  [OK] BUILD EXITOSO")
        print("=" * 60)
        print(f"  Ejecutable: {exe_path}")
        print(f"  Tamaño:     {size_mb:.1f} MB")
        print(f"  Config:     {config_dst}")
        print()
        print("  PARA DESPLEGAR EN OTRAS PCs:")
        print("  1. Copia ITAMAgent.exe y config.json a la PC destino")
        print("  2. Edita config.json -> cambia 'api_url' a la IP del servidor")
        print("  3. Ejecuta ITAMAgent.exe como Administrador")
        print("=" * 60)
    else:
        print("\n[FAIL] No se encontró el ejecutable generado")
        sys.exit(1)


if __name__ == "__main__":
    build()

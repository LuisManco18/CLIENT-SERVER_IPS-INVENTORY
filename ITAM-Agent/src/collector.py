import wmi
import socket
import platform
import uuid
import pythoncom  # Necesario para threads con WMI

def get_system_data():
    """
    Recopila toda la información de la PC y retorna un diccionario
    listo para enviar al servidor.
    """
    try:
        # Inicializar WMI (necesario si se corre como servicio o thread)
        pythoncom.CoInitialize()
        c = wmi.WMI()
        
        # 1. Información General del Sistema
        # Win32_ComputerSystem: Marca, Modelo, RAM Total, Usuario
        sys_info = c.Win32_ComputerSystem()[0]
        
        # 2. Sistema Operativo
        os_info = c.Win32_OperatingSystem()[0]
        
        # 3. Procesador
        cpu_info = c.Win32_Processor()[0]
        
        # 4. BIOS (Para el Serial Number real)
        bios_info = c.Win32_BIOS()[0]
        
        # --- PROCESAMIENTO DE DATOS ---
        
        # Hostname
        hostname = socket.gethostname()
        
        # IP Address (Truco para obtener la IP real que sale a internet/red)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip_address = s.getsockname()[0]
            s.close()
        except:
            ip_address = "127.0.0.1"

        # MAC Address
        mac_num = uuid.getnode()
        mac_address = ':'.join(('%012X' % mac_num)[i:i+2] for i in range(0, 12, 2))

        # RAM en GB
        ram_bytes = int(sys_info.TotalPhysicalMemory)
        ram_gb = f"{round(ram_bytes / (1024**3), 1)} GB"

        # Usuario (limpiar dominio si existe)
        full_user = sys_info.UserName if sys_info.UserName else "No User"
        
        # Construimos el diccionario final
        data = {
            "serial_number": bios_info.SerialNumber.strip(),
            "hostname": hostname,
            "ip_address": ip_address,
            "mac_address": mac_address,
            "usuario": full_user,
            "marca": sys_info.Manufacturer.strip(),
            "modelo": sys_info.Model.strip(),
            "sistema_operativo": os_info.Caption.strip(),
            "procesador": cpu_info.Name.strip(),
            "memoria_ram": ram_gb
        }
        
        return data

    except Exception as e:
        print(f"Error recolectando datos WMI: {e}")
        return None
    finally:
        pythoncom.CoUninitialize()